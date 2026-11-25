# Testes: bugs no GitHub e relatórios de rodada

## Relatórios

Para envio: [Relatorio_Testes_rc1_rc2_GuiaRural.docx](Relatorio_Testes_rc1_rc2_GuiaRural.docx) (as duas rodadas num só documento). Os arquivos abaixo são a versão em Markdown de cada rodada.

| Rodada | Arquivo |
|---|---|
| rc1 (19/11/2026) | [relatorio-rodada-rc1.md](relatorio-rodada-rc1.md) |
| rc2 (20/11/2026, v1.4.1) | [relatorio-rodada-rc2.md](relatorio-rodada-rc2.md) |

Cada relatório traz projeto, rodada, versão e período, ambiente, casos executados com resultado esperado e obtido, métricas, bugs com situação e a cobertura de funcionalidades. Os números saem das **abas por caso de uso** da planilha, não das abas de síntese (digitadas à mão e desatualizadas).

## Como abrir um bug

Issues → **New issue** → **Bug (rodada de testes)**. O formulário fica em `.github/ISSUE_TEMPLATE/bug.yml` e só aparece depois que estiver na `main`.

| O que a disciplina pede | Onde fica |
|---|---|
| Identificador único | Número da issue (`#N`). Use nos commits e PRs. Um bug por issue. |
| Relato, esperado e observado | Campos "Descrição do erro", "Comportamento esperado" e "Comportamento observado" |
| Passos para reproduzir | Campo "Passos para reproduzir" e "Frequência" |
| Ambiente | "Ambiente", "Sistema operacional", "Navegador e versão", "Dispositivo e rede" |
| Gravidade e urgência | Duas listas no formulário; a triagem confirma pelos rótulos `severidade: …` e `urgência: …` |
| Status | Rótulos `status: …` (ver abaixo) mais aberta/fechada |
| Versão ou build | Campo "Versão / build": tag da release (ex.: `v1.4.1`) ou hash do commit, mais data e hora do teste |
| Capturas, logs, anexos | Campo "Capturas de tela, logs e outros anexos" (arrastar arquivos) |

Também há "Caso de teste (CT)" e "Rodada", para ligar o bug à planilha.

### Ciclo de status

`status: novo` (aplicado sozinho pelo formulário) → `status: em análise` → `status: em correção` → `status: corrigido` (correção integrada, falta verificar) → `status: verificado` (confirmado numa rodada) e a issue é fechada. Trocar o rótulo a cada passo. Um bug só vai para `verificado` quando o caso de teste é reexecutado e passa.

Gravidade: **crítica** (fora do ar, perda de dados, segurança), **alta** (função principal inutilizável, sem contorno), **média** (prejudicada, com contorno), **baixa** (cosmético ou de usabilidade). Urgência: **imediata** (bloqueia entrega ou testes), **alta**, **normal**, **baixa**.

## Como as métricas dos relatórios são calculadas

- **Planejado** = casos da planilha menos `Not planned` e `NA`.
- **Executado** = `Passed` + `Failed`. `Blocked` conta como tentado, mas sem veredito. `NoRun` é pendente.
- **Taxa de aprovação** = `Passed` ÷ executados.
- **Funcionalidades testadas** = casos de uso (abas) com ao menos um caso executado ÷ total de casos de uso.

Convenção recomendada para a planilha: `NoRun` para "ainda não executei" e `Not planned` apenas para "fora de escopo por decisão" (UC09, UC11, UC31). No rc2 o `Not planned` foi usado nos dois sentidos, o que distorce o planejado.
