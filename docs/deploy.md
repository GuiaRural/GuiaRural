# Deploy: frontend na Vercel, backend no Render

> Escrito em 15/11/2026. O backend já está no Render; este documento cobre o frontend na Vercel e o que precisa casar entre os dois.

## Como as peças se falam
```
navegador ──HTTPS──> Vercel (Next.js, frontend/) ──/api/*──> Render (Spring Boot) ──> Supabase (Postgres)
```
- O navegador só conversa com o site da Vercel. O Next **repassa** `/api/*` ao backend (`rewrites` em `frontend/next.config.ts`).
- Por isso **não há CORS** e os cookies de sessão (`GUIARURAL_SESSION`) e de CSRF (`XSRF-TOKEN`) são de primeira parte. O `SameSite=Strict` do backend funciona. **Não** chame o backend direto do navegador: quebraria o login do painel.
- O grafo da rota (`/campus-graph.json`) é arquivo estático servido pela própria Vercel.

## Variáveis de ambiente
| Onde | Variável | Valor | Observação |
|---|---|---|---|
| Vercel | `BACKEND_URL` | URL **HTTPS** do serviço no Render, sem barra no final (ex.: `https://guiarural-backend.onrender.com`) | Obrigatória. Sem ela, ou com `http://`, o **build da Vercel falha** de propósito. Não é segredo |
| Render | `SESSION_COOKIE_SECURE` | `true` | Obrigatória em HTTPS: sem isso o cookie de sessão vai sem `Secure` |
| Render | `DB_URL`, `DB_USER`, `DB_PASSWORD` | já configuradas | Supabase pelo **Session pooler** (a conexão direta só resolve por IPv6) |

Em desenvolvimento nada muda: sem `BACKEND_URL`, o frontend fala com `http://localhost:8080`. Nunca coloque segredo no `.env.example` nem em variável `NEXT_PUBLIC_*`.

## Configurar o projeto na Vercel (uma vez)
1. **Add New > Project** e importe o repositório `GuiaRural/GuiaRural` do GitHub.
2. **Root Directory:** `frontend`. Framework: Next.js (detectado). Comandos de build e de instalação ficam nos padrões.
3. **Node.js Version:** 24 (a mesma do `release.yml`).
4. **Environment Variables:** `BACKEND_URL`, marcada para **Production e Preview**.
5. **Production Branch:** `main`. Cada PR gera um deploy de Preview.
6. Deploy.

## Depois do primeiro deploy: conferir
Com o endereço da Vercel (`https://<projeto>.vercel.app`):
- [ ] A página inicial abre e o mapa mostra os locais (`/api/places` chega pelo site).
- [ ] `/cursos`, `/avisos`, `/servicos` e `/acolhimento/cultura` carregam dados.
- [ ] `/api/auth/me` responde `401` sem login (e não `404` nem `502`).
- [ ] Login no painel (`/admin/login`) funciona e **continua logado depois de recarregar** (cookie de sessão com `Secure`).
- [ ] Uma escrita no painel funciona (confirma o cabeçalho `X-XSRF-TOKEN` pelo proxy), por exemplo despublicar e republicar um aviso.
- [ ] Trocar o idioma e traçar uma rota no mapa (`/campus-graph.json` carrega).
- [ ] **Foto de local com mais de 4,5 MB:** o limite de corpo de requisição de funções da Vercel é 4,5 MB e o backend aceita até 5 MB. Não está confirmado que o `rewrite` externo sofra esse limite: testar com uma foto de 4,6 a 5 MB e, se falhar, reduzir o limite do formulário para 4 MB.

## Riscos e pontos de atenção
- **Previews falam com o backend de produção.** Um PR deployado como Preview usa o mesmo `BACKEND_URL` e, se alguém logar no painel por ele, grava no banco real. Enquanto não houver um backend de homologação (o CLAUDE.md prevê 4 ambientes), mantenha a proteção padrão de Preview da Vercel (exige login Vercel) e não use o painel nos Previews. Se quiser Preview apontando para outro backend, defina `BACKEND_URL` só no escopo Preview.
- **Partida a frio no Render.** Em plano gratuito, o serviço dorme após inatividade e a primeira requisição demora (dezenas de segundos). O site abre, mas o mapa e as listas esperam o backend acordar. Se isso incomodar, plano pago ou um ping periódico.
- **O release cria um segundo deploy.** O `release.yml` (semantic-release) faz um commit na `main` depois de cada merge, e a Vercel publica de novo. O conteúdo é o mesmo.
- **Domínio próprio:** trocar o domínio na Vercel não exige mudar nada no backend (não há CORS nem lista de origens).
- Mudar a URL do backend exige **novo deploy** do frontend: o endereço entra no build.
