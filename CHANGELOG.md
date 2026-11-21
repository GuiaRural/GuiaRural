# [1.4.0](https://github.com/GuiaRural/GuiaRural/compare/v1.3.0...v1.4.0) (2026-11-21)


### Features

* **db:** mensagens para a equipe (UC39) reaproveitam a tabela messages ([d688156](https://github.com/GuiaRural/GuiaRural/commit/d68815664d2e53ef7cbc56f57785984b0a757f90))
* **mensagens:** API de mensagens para a equipe com retenção de 15 dias (UC39) ([b23cdf4](https://github.com/GuiaRural/GuiaRural/commit/b23cdf43a6c4e99d940e27f12633c582331e2591))
* **mensagens:** tela pública Falar com a equipe e caixa de entrada do admin (UC39) ([4ca9480](https://github.com/GuiaRural/GuiaRural/commit/4ca9480bc4aac30eec0ebbf2da83814976e8684a))

# [1.3.0](https://github.com/GuiaRural/GuiaRural/compare/v1.2.0...v1.3.0) (2026-11-21)


### Bug Fixes

* **frontend:** busca aceita a sigla exata de 2 letras de um local publicado (CT-007.05) ([09e11dd](https://github.com/GuiaRural/GuiaRural/commit/09e11dd3a1879c0175388a751f4276bfd864184b))
* **frontend:** tela de duplicar cardápio diz de qual cardápio veio a cópia e pede a nova data (CT-025.03) ([37231cb](https://github.com/GuiaRural/GuiaRural/commit/37231cbbb00cf5e8cf23de5ef943d8f569ac7857))


### Features

* **backend:** departamentos que funcionam no local no PlaceResponseDTO (CT-037.01) ([343bad6](https://github.com/GuiaRural/GuiaRural/commit/343bad6fa9f09a870b2ae3d2636ec947c34b9743))
* **db:** categorias fixas do Guia de Recife (CT-040.04) ([a55b6ca](https://github.com/GuiaRural/GuiaRural/commit/a55b6ca66dedeabc906c5d9dcd22f40a1c2ee9dc))
* **frontend:** ação Editar descrição na lista de locais do painel (UC28) ([c67d98b](https://github.com/GuiaRural/GuiaRural/commit/c67d98b5119a5067646a2764dbd8125abedacfa2))
* **frontend:** botão amarelo da busca abre o traçado de rota com destino e origem (CT-038.04) ([87e6fce](https://github.com/GuiaRural/GuiaRural/commit/87e6fce8f46172d4fd56e0ceb60cbc2a86079025))
* **frontend:** filtro de cursos e departamentos em /cursos e trilha na página do curso (CT-008.02, CT-008.04) ([2ba567e](https://github.com/GuiaRural/GuiaRural/commit/2ba567e04764aa0327fad3375618985ffb4fa58e))
* **frontend:** link do local para o departamento e os cursos no cartão e na página (CT-037.01) ([70eeb81](https://github.com/GuiaRural/GuiaRural/commit/70eeb817bcf88902742284d94eebdc59ca2c4b9f))
* **guia:** /api/guide/recife devolve as categorias e a categoria de cada local ([941e0b8](https://github.com/GuiaRural/GuiaRural/commit/941e0b8d25a274d2decda755c59dcd66df5b1c5c))
* **guia:** filtro do Guia de Recife usa as categorias fixas do servidor ([907a750](https://github.com/GuiaRural/GuiaRural/commit/907a750fffd4f8b859337660fb5af29033deaab9))
* **guia:** filtro por categoria no Guia de Recife (CT-040.02) ([6fa2a55](https://github.com/GuiaRural/GuiaRural/commit/6fa2a55ed2c5a528de40054c776403129dfe83ae))

# [1.2.0](https://github.com/GuiaRural/GuiaRural/compare/v1.1.0...v1.2.0) (2026-11-15)


### Features

* **deploy:** endereço do backend por variável de ambiente para o deploy na Vercel ([14c40e3](https://github.com/GuiaRural/GuiaRural/commit/14c40e3a23b58929023a1c7894edaa00328f8e53))

# [1.1.0](https://github.com/GuiaRural/GuiaRural/compare/v1.0.0...v1.1.0) (2026-11-15)


### Bug Fixes

* **admins:** trava os gerais ativos antes de checar o último geral ([92ab3f6](https://github.com/GuiaRural/GuiaRural/commit/92ab3f6bd1868fce45f24bb101112799ef40c107))
* **contatos:** concluir integração de contatos da fase 4 ([8c1a38d](https://github.com/GuiaRural/GuiaRural/commit/8c1a38db086d0f4b4e5e044e2eefbc7b924fb91b))
* **frontend:** corrige erro de digitação no Guia de Recife ([59c1804](https://github.com/GuiaRural/GuiaRural/commit/59c18049e3c2a15671234e01b7d305f795e0c48c))
* **migrations:** permitir banner de apoio sem CTA na migration da fase 4 ([09fbe37](https://github.com/GuiaRural/GuiaRural/commit/09fbe371c22c376ce77319ff6ea4832dd9330d52))
* **notices:** responde 404 em vez de 500 quando o aviso não existe ([21cc555](https://github.com/GuiaRural/GuiaRural/commit/21cc55596f90b4fd64d4e3f7e8290280a161f7c2))


### Features

* **admin-ui:** editor da matriz curricular no formulário de curso (UC35, FA-35.01) ([51c751f](https://github.com/GuiaRural/GuiaRural/commit/51c751fd6df883b8c0b0494f5e98b00c611b16da))
* **admin-ui:** histórico reconhece a entidade curso ([01b56a0](https://github.com/GuiaRural/GuiaRural/commit/01b56a02a0764316d3c619ce5833f40250a2c697))
* **admin-ui:** telas de cursos no painel (UC35, UC36) ([8c848e7](https://github.com/GuiaRural/GuiaRural/commit/8c848e7f78f0a34d05a9be034fb780f9bdb0babb))
* **audit:** histórico de mudanças gravado no servidor (RNF06) ([b7e1fc7](https://github.com/GuiaRural/GuiaRural/commit/b7e1fc7f5d212b4a85dd88d5458efa69021da254))
* **backend:** API do cardápio do RU com CRUD auditado e leitura pública ([86dc149](https://github.com/GuiaRural/GuiaRural/commit/86dc149ba1a53f8cb6d7a035d56d9782f0092086))
* **backend:** cadastro, aprovação e revogação de administradores (UC13) ([5288336](https://github.com/GuiaRural/GuiaRural/commit/5288336aaf23f90ddd82af69064f5cacfa307ca5))
* **backend:** CRUD de locais do painel com vínculos, responsável e foto (UC14 a UC16) ([8ed0e4d](https://github.com/GuiaRural/GuiaRural/commit/8ed0e4d612c7f5de8a1938c277b6bedf9b519f1b))
* **backend:** desfazer pelo histórico para local, serviço, aviso e cardápio (UC23) ([900da9e](https://github.com/GuiaRural/GuiaRural/commit/900da9e2710a4a146affdfb0f4d108e4aa5f1b6c))
* **core:** trata BadRequestException como 400 com ProblemDetail ([4eeae73](https://github.com/GuiaRural/GuiaRural/commit/4eeae73ecf4ef25ec3afd4c413cab28df97ca058))
* **courses-ui:** cursos em PT, EN e ES nas páginas públicas e aviso de tradução no painel (RF04) ([5919a5f](https://github.com/GuiaRural/GuiaRural/commit/5919a5f17b616520e460537aefbaf2a39abe4786))
* **courses:** cadastro, edição e exclusão de cursos pelo painel (UC35, UC36) ([708fb3f](https://github.com/GuiaRural/GuiaRural/commit/708fb3f5be06a07356e9a190d18f0da07dafe59b))
* **courses:** conteúdo do curso em PT, EN e ES com ?lang= e marcador de tradução automática (RF04) ([c1f6f68](https://github.com/GuiaRural/GuiaRural/commit/c1f6f68f8d7269004568bff8a4572862dada9a97))
* **courses:** matriz curricular na escrita do curso (UC35, FA-35.01) ([88cb063](https://github.com/GuiaRural/GuiaRural/commit/88cb0633ce3fbf9f9980926bdb449e11740b2395))
* **courses:** serviço do painel para cursos com validação e testes (UC35, UC36) ([7397e57](https://github.com/GuiaRural/GuiaRural/commit/7397e57ec56a1791b14b961e3f23ec904d5b8a7d))
* **db:** audit_logs aceita a entidade curso ([2eb1ef3](https://github.com/GuiaRural/GuiaRural/commit/2eb1ef39b7d19fb25d461d1a4ef2c1c37e6faed3))
* **db:** carga dos locais que só existiam no mock (RU, HOVET, portarias, auditório) ([cf2d11f](https://github.com/GuiaRural/GuiaRural/commit/cf2d11f6e4da4c5160eac3ad0c49e21967dc62f0))
* **db:** carga inicial do guia de acolhimento e do Guia de Recife ([b051e26](https://github.com/GuiaRural/GuiaRural/commit/b051e264c375e909cdcd90b86cc5ee28533485f1))
* **db:** coluna password_hash em admins para o login real ([9e428a1](https://github.com/GuiaRural/GuiaRural/commit/9e428a10762967e68283c865516aae80547d1a49))
* **db:** marca os idiomas totalmente traduzidos de cada tópico do guia ([efdbae0](https://github.com/GuiaRural/GuiaRural/commit/efdbae035ba3b73831d84f98ac331500b2131f6c))
* **db:** opção vegetariana obrigatória no cardápio ([5698153](https://github.com/GuiaRural/GuiaRural/commit/5698153c5467be96995dac07c2215d2d0f81e5f3))
* **db:** regras dos campos do formulário de serviços ([dbebf99](https://github.com/GuiaRural/GuiaRural/commit/dbebf99e91f908a786d48e3200cc824ac375c2f5))
* **db:** tabelas de contatos, downloads e aviso de apoio do guia ([82634b0](https://github.com/GuiaRural/GuiaRural/commit/82634b01fc05048854b36f5f87836aab11775f6e))
* **db:** tabelas de vínculos e foto do local (serviços, cursos, foto) ([6cd79cd](https://github.com/GuiaRural/GuiaRural/commit/6cd79cd8e26e620553efe28347a4cbdf9b95d27f))
* Dockefile para teste de deploy ([7c86175](https://github.com/GuiaRural/GuiaRural/commit/7c8617598ea63e9ce8211072d99cd9258281d906))
* **frontend:** administradores do painel pela API (UC13) ([0c78d95](https://github.com/GuiaRural/GuiaRural/commit/0c78d95120b81a5d1d6060357241244310995d32))
* **frontend:** avisos usam /api/avisos e o serviço duplicado é removido ([66f3831](https://github.com/GuiaRural/GuiaRural/commit/66f3831720a1f3c98c399888dff92f93ef391215))
* **frontend:** botão e formulário para publicar aviso no painel ([f573ef4](https://github.com/GuiaRural/GuiaRural/commit/f573ef41131c8fed9c33fa7e20b962a51cf0c9f3))
* **frontend:** editar aviso no painel ([cc21cf7](https://github.com/GuiaRural/GuiaRural/commit/cc21cf79b8ca5cf7728ae6948c09a80b9541d951))
* **frontend:** editar e excluir serviço no painel (UC20 e UC21) ([3698f87](https://github.com/GuiaRural/GuiaRural/commit/3698f874b90d77e48f048e9af49a1fdd0d898ec6))
* **frontend:** guia de acolhimento, Guia de Recife e painel do guia usam /api/guide ([b404ecf](https://github.com/GuiaRural/GuiaRural/commit/b404ecf5c6ee2a060af5f3348bf799a338a94a7e))
* **frontend:** histórico só do servidor e desfazer de local, serviço, aviso e cardápio (UC23) ([80f2788](https://github.com/GuiaRural/GuiaRural/commit/80f278839095c8340aa0003fb9c0bca90b200d9b))
* **frontend:** locais do painel pela API, com foto, cursos, serviços e responsável (UC14 a UC16) ([050cbfc](https://github.com/GuiaRural/GuiaRural/commit/050cbfc9f7ce348d0dbd898a059b0f839d5c18c0))
* **frontend:** login do painel usa o backend, com cookie de sessão e token CSRF ([dd71704](https://github.com/GuiaRural/GuiaRural/commit/dd717043b9d501fcd50a1a7a7d34d874bbeefb2c))
* **frontend:** menuService passa a usar /api/menus no lugar do localStorage ([24b2f95](https://github.com/GuiaRural/GuiaRural/commit/24b2f9538f16149d7af2148ad56d67d0073e160f))
* **frontend:** página do local e /servicos mostram os vínculos ([334850b](https://github.com/GuiaRural/GuiaRural/commit/334850bb7ffa87408ab0f1b3bffa71bfe1e0e08e))
* **frontend:** painel do guia grava pelo backend e o histórico vem do servidor ([6712da1](https://github.com/GuiaRural/GuiaRural/commit/6712da1d2ee0d5b3f18d2918b0bbc8c5c441ddaa))
* **frontend:** tela de serviços lista e cadastra pelo banco ([9887cda](https://github.com/GuiaRural/GuiaRural/commit/9887cda88829c23c6f5ee6bf89bb59f9061671ef))
* **frontend:** telas de criar, editar e Cardápio da semana leem e gravam no banco ([1d7cf42](https://github.com/GuiaRural/GuiaRural/commit/1d7cf4226c9ee0c06c31dc01b09d8d3cd848f2be))
* **frontend:** UC11 página pública /servicos com os serviços publicados ([913cb87](https://github.com/GuiaRural/GuiaRural/commit/913cb8701fec220f5f14594cace9c28007dc3637))
* **frontend:** UC27 excluir cardápio no painel, com confirmação ([02e7bb8](https://github.com/GuiaRural/GuiaRural/commit/02e7bb8f893d4625a8d5cf1b494a0e7cba16289d))
* **info:** busca, fullyTranslated e traduções do guia para o painel admin ([de9b9b0](https://github.com/GuiaRural/GuiaRural/commit/de9b9b00f65cf5f337a5e2159d6f051688a43d1a))
* **info:** criar, editar, excluir e desfazer tópicos do guia pelo painel ([9167d38](https://github.com/GuiaRural/GuiaRural/commit/9167d381f12f2db59ef592d8d01c32e1094bef0c))
* **info:** endpoints públicos do guia de acolhimento e do Guia de Recife ([ad33f73](https://github.com/GuiaRural/GuiaRural/commit/ad33f735365c6d58e05427a394c3889f0df4d522))
* **locais:** páginas públicas de portarias, onde comer e espaços de estudo ([fff7458](https://github.com/GuiaRural/GuiaRural/commit/fff74585ae8bf2452f745bcd1bc19adc30b91bac))
* **login:** login por sessão com cookie HttpOnly, CSRF e permissões no backend ([236d18b](https://github.com/GuiaRural/GuiaRural/commit/236d18ba973e622589a469c637dae60aa1c08be4))
* **notices:** limites de tamanho do aviso validados no servidor ([55cc141](https://github.com/GuiaRural/GuiaRural/commit/55cc141099f9e219d3c260cefb65609c497feceb))
* **places-ui:** locais, departamentos e busca em PT, EN e ES nas páginas públicas (RF04) ([158e03b](https://github.com/GuiaRural/GuiaRural/commit/158e03b5d75a99be83cedbabca486653a195a5d7))
* **places:** locais e departamentos em PT, EN e ES com ?lang= e busca por idioma (RF04) ([c621dc1](https://github.com/GuiaRural/GuiaRural/commit/c621dc1a3f7eb8a396f6780c1c3e9c79cb131673))
* **routing:** biblioteca de roteamento a pé pela malha do campus (etapa 2) ([6c97562](https://github.com/GuiaRural/GuiaRural/commit/6c9756247e7793f01b07091b35eddbbeb4ff5d7c))
* **routing:** gerador do grafo de caminhada do campus a partir do OSM (etapa 1) ([49ae7f5](https://github.com/GuiaRural/GuiaRural/commit/49ae7f5e3df044e7da9a260b61df2f549c295686))
* **routing:** grafo do campus e relatório gerados do OSM (46 KB) ([51732b7](https://github.com/GuiaRural/GuiaRural/commit/51732b76ae8b4f30acc225609f85f075058ceb40))
* **routing:** rota a pé pela malha do campus no mapa, no cartão e na página do local (etapas 3 e 4) ([f910a8f](https://github.com/GuiaRural/GuiaRural/commit/f910a8f685c7680a85ea7d19b18fb3d08b0ddfbe))
* **services:** serviços guardam todos os campos do formulário ([909b293](https://github.com/GuiaRural/GuiaRural/commit/909b2930111930652f1d2d06dcc3511c7fdc0f36))
* **servicos:** lista pública, busca e filtro por categoria no servicosService ([77246f6](https://github.com/GuiaRural/GuiaRural/commit/77246f6735584158a57d8d6ef9ee4f3f80321ede))

# 1.0.0 (2026-11-04)


### Bug Fixes

* **a11y:** botão fechar do Modal traduzido e id do título único ([e69a37a](https://github.com/GuiaRural/GuiaRural/commit/e69a37a4220e4d8e0f1e22e33bceb3e91829bfd3))
* **a11y:** UC09 links externos da cartilha avisam que abrem em nova aba ([a07276c](https://github.com/GuiaRural/GuiaRural/commit/a07276c9a5866610ddd11a43741462d8164454a3))
* **a11y:** UC12 liga a mensagem de erro do login aos campos inválidos ([5edda94](https://github.com/GuiaRural/GuiaRural/commit/5edda9460b76507354882e151c4abe27253caa8f))
* **a11y:** UC13 liga erros e dicas do cadastro de administrador aos campos ([a50125c](https://github.com/GuiaRural/GuiaRural/commit/a50125c3109190e17f46a889706761f11054a0c2))
* **a11y:** UC14 foco visível e erro ligado no envio da foto de fachada ([b654dd5](https://github.com/GuiaRural/GuiaRural/commit/b654dd55399cd5bd5ae4ee9b95079e288218aa58))
* **a11y:** UC23 botão Ver detalhes identifica o registro e mostra foco ([4f56c55](https://github.com/GuiaRural/GuiaRural/commit/4f56c557f43b7b5f353137266944b8f63ca2067f))
* **a11y:** UC25 campos obrigatórios do cardápio anunciados ao leitor de tela ([b9c853f](https://github.com/GuiaRural/GuiaRural/commit/b9c853f95e28e55943ca65b670ae3b613ca68409))
* add new documents and update frontend components ([2da77bb](https://github.com/GuiaRural/GuiaRural/commit/2da77bb94a7d2dd5e56f0bd680cc7b728e2698d8))
* **db:** ativa RLS e remove acesso anon das tabelas existentes ([28f8dc9](https://github.com/GuiaRural/GuiaRural/commit/28f8dc92196378719074c22aa159f93ed5afee23))
* **frontend:** aberto/fechado calculado no horário de Recife ([7828bb4](https://github.com/GuiaRural/GuiaRural/commit/7828bb44a000b848bf26409f4b8507da4fcd98b1))
* **frontend:** fixa a raiz do Turbopack na pasta frontend ([df6ed7c](https://github.com/GuiaRural/GuiaRural/commit/df6ed7c0a57977c9e8b1c96abca862afea719a58))
* **frontend:** restaura o ícone megaphone removido no merge do UC19 ([ca9924a](https://github.com/GuiaRural/GuiaRural/commit/ca9924ad5305cec8b52395b0aa22c9281ecb2f81))
* Mudando App.jsx e main.jsx para .tsx ([55efb4c](https://github.com/GuiaRural/GuiaRural/commit/55efb4c00a5e595170981baffec1c288f853e126))
* removendo arquivos temporários de notices e services ([688ee42](https://github.com/GuiaRural/GuiaRural/commit/688ee426ed2d6fe3a9d301c3f3e8d96adadd86c7))
* resolve conflito de merge na pagina de login ([982b159](https://github.com/GuiaRural/GuiaRural/commit/982b159cf10954955b3f5c764caab7add3fe8301))
* **uc14:** horário de funcionamento recusa hora acima de 23 e minuto acima de 59 ([e9822df](https://github.com/GuiaRural/GuiaRural/commit/e9822df8fed7989a002802592ae90b2e590f2812))
* **uc14:** rola até o resumo em todos os erros ao salvar o local ([b51f829](https://github.com/GuiaRural/GuiaRural/commit/b51f82981467e3ef0b11422f58fe7458129d1850))
* Update map configuration and mock data ([8a0ba72](https://github.com/GuiaRural/GuiaRural/commit/8a0ba7243e6bd51f245f87534f3065f4c83b1f58))


### Features

* add initial implementation of the home page and common components ([b4899b3](https://github.com/GuiaRural/GuiaRural/commit/b4899b349a2a5495ae8c143dbc7565639d2baf1a))
* **backend:** busca de sugestões de locais, departamentos e cursos (UC38) ([f29b7f8](https://github.com/GuiaRural/GuiaRural/commit/f29b7f822da511495ebd4640bfb06565ad369dca))
* **backend:** endpoints de leitura de departamentos e cursos (UC37) ([0af144a](https://github.com/GuiaRural/GuiaRural/commit/0af144aa53767f13f7262eec86eab42d3e07cd1b))
* **backend:** endpoints de locais e slug do local no departamento ([1e97b7b](https://github.com/GuiaRural/GuiaRural/commit/1e97b7ba4393cea7efcb65137f7aa3344cbe9dcf))
* **backend:** entidade e repositório de locais e vínculo do departamento ([fca62be](https://github.com/GuiaRural/GuiaRural/commit/fca62be1d1d0d278a6aacaf05ed1141800cfada4))
* **backend:** entidades e repositórios de departamentos, cursos e matriz ([2b8abc7](https://github.com/GuiaRural/GuiaRural/commit/2b8abc796fd27627395df214ba2685aeaa5330b1))
* **backend:** implementa CRUD de serviços de prédio e testes unitários ([f1c9957](https://github.com/GuiaRural/GuiaRural/commit/f1c9957f1f3e5e5dccefbb7acb735e1c73353c2b))
* **backend:** tratamento global de erros com 404 e 400 ([6f64002](https://github.com/GuiaRural/GuiaRural/commit/6f640021f3ca1ba3ab65dd6efd6b27a7f6de6a9b))
* Criação do .env no backend para ocultar dados importantes ([28f9965](https://github.com/GuiaRural/GuiaRural/commit/28f9965c8282d45b725b0cae4579fc1c3b0ca284))
* CRUD de mensagens e avisos ([17dca95](https://github.com/GuiaRural/GuiaRural/commit/17dca95526a5b4138c78744ffb9fc78cf6bfa7ae))
* **db:** carga horária total no curso ([0419ec6](https://github.com/GuiaRural/GuiaRural/commit/0419ec654404d20dde54d826c712902187be7b15))
* **db:** carga inicial de locais e departamentos a partir dos documentos ([4f5b08a](https://github.com/GuiaRural/GuiaRural/commit/4f5b08a847e074389b4da907bfb14c1d672da26e))
* **db:** colunas de tradução e campos de conteúdo em locais, cursos e serviços ([2b42239](https://github.com/GuiaRural/GuiaRural/commit/2b422391ec1c32575beae48e175820b3843b8b8b))
* **db:** cria as tabelas services, avisos, messages e contacts que só existiam via Hibernate ([8e45bfb](https://github.com/GuiaRural/GuiaRural/commit/8e45bfbaa352d89476e95a75d46e9bdfc6781d79))
* **db:** tabela de locais e vínculo dos departamentos com o local ([5f11c11](https://github.com/GuiaRural/GuiaRural/commit/5f11c11928213847c3b5ab08c29d0c609b108683))
* **db:** tabela menus (cardápio do RU) ([ca8185f](https://github.com/GuiaRural/GuiaRural/commit/ca8185fba32eb9825b55afaca478d91b002bc4ab))
* **db:** tabelas admins e audit_logs (log imutável) ([f87c870](https://github.com/GuiaRural/GuiaRural/commit/f87c8705df341b136396ef7be8c5995af9e6efee))
* **db:** tabelas de departamentos, cursos e matriz curricular ([847f534](https://github.com/GuiaRural/GuiaRural/commit/847f53403fb4732f7217a66db6e9421017e6a666))
* **db:** tabelas do guia de acolhimento e do Guia de Recife com colunas de tradução ([80ec728](https://github.com/GuiaRural/GuiaRural/commit/80ec72849e5dbc01c93d0ff20f7ecbae50911451))
* **frontend:** adicionar serviço no painel admin (UC19) ([30a525b](https://github.com/GuiaRural/GuiaRural/commit/30a525b3eb8a85a9ba794951f3159f8fbdf76977))
* **frontend:** cliente da API e serviço de departamentos e cursos ([95b3327](https://github.com/GuiaRural/GuiaRural/commit/95b3327b8cd4bf38929a18384a3bc40445c648a7))
* **frontend:** deletar aviso no painel admin (UC18) ([8e76561](https://github.com/GuiaRural/GuiaRural/commit/8e76561befd96c4dffa97b62147c5d492d2a65fc))
* **frontend:** locais públicos lidos do backend (/api/places) com cache ([a16b156](https://github.com/GuiaRural/GuiaRural/commit/a16b156bb93169131176fe4c0504be93a749cdb6))
* **frontend:** local selecionado na URL (?local=) com voltar e avançar ([03d2147](https://github.com/GuiaRural/GuiaRural/commit/03d2147c83db69df1bc4511d08bcb5f519e844ac)), closes [#232](https://github.com/GuiaRural/GuiaRural/issues/232)
* **frontend:** página Guia de Recife & RMR (UC40, visão pública) ([3cd55c2](https://github.com/GuiaRural/GuiaRural/commit/3cd55c2fc56ba5bf708264cf0104ad719f6830ea))
* **frontend:** Prédio Central como origem padrão e categorias moradia e apoio ([f7be249](https://github.com/GuiaRural/GuiaRural/commit/f7be249b4a5e961bdf3369bcbcf787b1a238a4aa))
* **frontend:** selecionar local no mapa (UC06, card flutuante e página completa) ([b991e0f](https://github.com/GuiaRural/GuiaRural/commit/b991e0f21809e9c87452f96d5ca4d211d1034efb))
* **frontend:** serviço de busca de departamentos e cursos e placeSlug no departamento ([266594a](https://github.com/GuiaRural/GuiaRural/commit/266594a24ddd4980e879e8e071d8627d0383def8))
* **frontend:** sugestões de departamentos e cursos na busca e atalho Ctrl/⌘+K (UC38) ([f17f13d](https://github.com/GuiaRural/GuiaRural/commit/f17f13d3e637a22a8c01f982b1e75bd1982986d2))
* **frontend:** tela de login do UC12 fiel ao protótipo ([86bdc75](https://github.com/GuiaRural/GuiaRural/commit/86bdc75802715833d5beb734efcec4e7829df5b3))
* **frontend:** telas de departamento, cursos e matriz curricular (UC37) ([a570626](https://github.com/GuiaRural/GuiaRural/commit/a5706263e3f409112aa667a1569eabe834a6ad9e))
* **frontend:** telas de mapa e local com dados do banco e estados de falha ([06183cc](https://github.com/GuiaRural/GuiaRural/commit/06183cc699c38dd75de32ad3f31fb3bed56c433f))
* **frontend:** telas públicas dos UC01, UC02, UC09, UC10 e login do UC12 ([e438c5e](https://github.com/GuiaRural/GuiaRural/commit/e438c5e91811530668d5635245432896b8d129e7))
* **frontend:** textos da busca em PT, EN e ES (nenhum resultado, departamento, curso) ([89f0680](https://github.com/GuiaRural/GuiaRural/commit/89f0680ee0b62d2cdd6eba776a0327652607ad7e))
* **frontend:** textos de cursos e departamentos em PT, EN e ES ([86e2bb3](https://github.com/GuiaRural/GuiaRural/commit/86e2bb3415e0706c3e895eb556445fd105d7a8fe))
* **frontend:** UC09, UC10, UC23, UC24, UC25 e edição de avisos e acolhimento no painel ([5d302f7](https://github.com/GuiaRural/GuiaRural/commit/5d302f76d8e289526ee36c79d1a9753c65919778))
* **frontend:** UC13 cadastrar administrador no painel ([f9cfbee](https://github.com/GuiaRural/GuiaRural/commit/f9cfbee55c46d75343b0efcdd010dbe01137fd71))
* **guia-recife:** finaliza módulo do guia de recife e ajusta sidebar ([0483421](https://github.com/GuiaRural/GuiaRural/commit/0483421f0b16c80ef39a7c5d466231e0a1c299a6))
* implementa edicao de cardapio UC26 ([d647b4f](https://github.com/GuiaRural/GuiaRural/commit/d647b4f5537d1483b538bb8aa84682248bce70e5))
* Implementando CRUD básico de avisos ([a85749a](https://github.com/GuiaRural/GuiaRural/commit/a85749a041c8422bf956b7c3d334125a0b811ed5))
* initial commit with backend and frontend setup ([574a68e](https://github.com/GuiaRural/GuiaRural/commit/574a68e7cc0e424650b720ffd69bba79c386bfd1))
* mapa usável ([5a4dde4](https://github.com/GuiaRural/GuiaRural/commit/5a4dde4b06bdd8828f64d8fd9931ecab00a7d35f))
* UC31 Crud de contatos ([414fa25](https://github.com/GuiaRural/GuiaRural/commit/414fa25b5d601c7fceae02a8f66bad67b83ad83e))
