-- Carga inicial dos locais da Sede a partir de docs/coordenadas_ufrpe.docx (latitude e longitude, em WGS84,
-- "obtidas pelo Google Places") e docs/relação dos Prédios da UFRPE_Sede (1).docx (descrições).
-- Nada além disso foi preenchido: telefone, e-mail, endereço e horário ficam nulos até alguém da UFRPE confirmar
-- (a única exceção é o horário da Editora Universitária, que consta no documento de prédios).
-- CEU e Casa Samyr Pessoa vêm como "não encontrado" no documento de coordenadas: entram como rascunho, sem
-- posição, e só aparecem no mapa depois de georreferenciados (RN-UC14.01).
-- Os pontos são do Google Places e não foram conferidos em campo. Portarias e RU não constam nesses documentos
-- e por isso não entram aqui.

insert into public.places (slug, name, short_name, category, status, latitude, longitude, coordinates_source, hours, description) values
  -- Prédios principais
  ('reitoria', 'Prédio Central (Reitoria)', 'Reitoria', 'administrativo', 'publicado', -8.0142355, -34.9508648, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'O mais icônico edifício do campus (com formato arquitetônico semelhante a um avião). Abriga a Reitoria, gabinetes administrativos, o Salão Nobre, auditórios, salas de aula e o Restaurante Universitário (RU) no seu entorno.'),
  ('apoio-administrativo', 'Prédio de Apoio Administrativo (PROGEPE)', 'Apoio Administrativo', 'administrativo', 'publicado', -8.0146262, -34.9473549, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Concentra pró-reitorias essenciais como a PROGEPE (Gestão de Pessoas), PROGESTi (Gestão Estudantil) e a PRPPG (Pesquisa e Pós-Graduação), situado próximo à Biblioteca Central.'),
  ('biblioteca', 'Biblioteca Central', 'Biblioteca', 'biblioteca', 'publicado', -8.0135867, -34.9487799, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Edifício de múltiplos setores que guarda o acervo principal de livros, periódicos e áreas de estudo da instituição.'),
  ('cegoe', 'CEGOE (Centro de Ensino de Graduação)', 'CEGOE', 'sala', 'publicado', -8.0175648, -34.9498627, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Grande complexo de salas de aula modernas e blocos de apoio didático voltados às disciplinas básicas e graduações gerais.'),
  ('ariano-suassuna', 'Prédio Ariano Suassuna', null, 'departamento', 'publicado', -8.0192671, -34.9497420, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Setorizado verticalmente por departamentos de ciências humanas e sociais aplicadas: térreo, Ciências Sociais (DECISO); 1º andar, Departamento de História; 2º andar, Departamento de Administração; 3º andar, Departamento de Letras.'),

  -- Departamentos e centros de ensino
  ('ceagri-1', 'CEAGRI I', 'CEAGRI I', 'sala', 'publicado', -8.0178142, -34.9441041, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Centro de Ciências Agrárias I: prédio de salas de aula e atividades acadêmicas do Campus Sede, ao lado do CEAGRI II, formando um importante complexo didático na área central do campus.'),
  -- O documento de coordenadas junta CEAGRI II e DC num único ponto, mas o de prédios descreve o DC como "bloco próprio".
  ('dc', 'CEAGRI II / DC (Departamento de Computação)', 'DC', 'departamento', 'publicado', -8.0176682, -34.9445171, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'CEAGRI II (Edifício Vasconcelos Sobrinho): funcionam coordenações de cursos tecnológicos e de exatas, incluindo o bacharelado em Sistemas de Informação (BSI). O Departamento de Computação (DC) tem bloco próprio dedicado aos laboratórios de tecnologia, pesquisa em inteligência artificial e salas de aula de computação.'),
  ('complexo-biologia', 'Complexo de Biologia (Newton Banks / Prédio Novo)', 'Biologia', 'departamento', 'publicado', -8.0137303, -34.9506149, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Composto pelo antigo Prédio Newton Banks e o Prédio Novo da Biologia, abrigando salas de aula, salas das coordenações, salas dos programas de Educação Tutorial, laboratórios de zoologia, botânica, genética e o Laboratório de Estudos Herpetológicos (LEHP).'),
  ('cegen', 'CEGEN', 'CEGEN', 'sala', 'publicado', -8.0159833, -34.9512226, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Centro de Ensino de Graduação Enedino Nunes: prédio de salas de aula voltado para as disciplinas de exatas (matemática, física e algumas disciplinas de química).'),
  ('educacao', 'Prédio de Educação', null, 'departamento', 'publicado', -8.0185858, -34.9495995, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Sede do Departamento de Educação, com salas voltadas para licenciaturas e formação docente.'),
  ('deagri', 'DEAGRI', 'DEAGRI', 'departamento', 'publicado', -8.0174039, -34.9468107, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Prédio de Engenharia Agrícola: bloco voltado para as pesquisas e maquinários da engenharia voltada ao campo.'),
  ('agronomia', 'Agronomia', null, 'departamento', 'publicado', -8.0175184, -34.9457482, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Um dos setores mais tradicionais do campus, com laboratórios de solos e fitossanidade.'),
  ('zootecnia', 'Zootecnia', null, 'departamento', 'publicado', -8.0202232, -34.9543923, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Bloco com salas de aula especializadas e laboratórios de nutrição animal.'),
  ('medvet', 'Medicina Veterinária (Hospital Veterinário)', 'Medicina Veterinária', 'departamento', 'publicado', -8.0148713, -34.9486550, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Bloco com salas de aula especializadas, laboratórios e o Hospital Veterinário da UFRPE.'),
  ('uaeadtec', 'UAEADTec', 'UAEADTec', 'departamento', 'publicado', -8.0197969, -34.9483818, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Prédio da Unidade Acadêmica de Educação a Distância e Tecnologia.'),
  ('ipe', 'Instituto IPÊ', 'IPÊ', 'administrativo', 'publicado', -8.0169292, -34.9495915, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Edifício que apoia núcleos de inovação, empreendedorismo, relações institucionais e internacionalização.'),
  ('propesq', 'Propesq', 'Propesq', 'administrativo', 'publicado', -8.0136774, -34.9481700, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Prédio da Pró-Reitoria de Pesquisa, que abriga laboratórios e salas voltadas às pesquisas na UFRPE.'),
  ('dqv', 'DQV', 'DQV', 'saude', 'publicado', -8.0141151, -34.9471799, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'O Departamento de Qualidade de Vida opera em um prédio próprio voltado à promoção de saúde e bem-estar.'),
  ('proexc', 'PROExC', 'PROExC', 'administrativo', 'publicado', -8.0146518, -34.9474609, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'A Pró-Reitoria de Extensão, Cultura e Cidadania (anteriormente chamada de Proext) fica em um casarão/prédio próprio histórico e muito arborizado.'),
  ('quimica', 'Departamento de Química', 'DQ', 'departamento', 'publicado', -8.0145840, -34.9506780, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'O Departamento de Química fica em uma das alas do Prédio Central da universidade.'),

  -- Esportes, apoio e serviços
  ('ceu', 'CEU (Centro de Esportes Universitário)', 'CEU', 'esporte', 'rascunho', null, null, null, null,
   'Composto por quadras cobertas, campos de futebol e pistas de atletismo.'),
  ('horta', 'Prédio da Horta', null, 'apoio', 'publicado', -8.0181368, -34.9524507, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Prédio da Horta e setores de campo: áreas experimentais utilizadas para aulas práticas de agronomia e engenharia florestal.'),
  ('biblioteca-setorial', 'Biblioteca Setorial', null, 'biblioteca', 'publicado', -8.0162581, -34.9492657, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Prédio espelhado que abriga parte do acervo didático da UFRPE, salas de estudos e auditório.'),
  ('def', 'DEF (Quadra Coberta)', 'DEF', 'esporte', 'publicado', -8.0179786, -34.9493715, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'O prédio do Departamento de Educação Física, juntamente com a sua Quadra Coberta, fica após o complexo do CEGOE. O acesso de ônibus mais próximo deixa os estudantes na altura da Estrada dos Pintos ou na entrada lateral do CEU.'),
  ('editora', 'Editora Universitária', null, 'apoio', 'publicado', -8.0196163, -34.9483981, 'Google Places (docs/coordenadas_ufrpe.docx)', '07:30-17:00',
   'Prédio logo atrás do complexo do Prédio Central, próximo à área sombreada do bosque da universidade. Funciona de segunda a sexta, das 7h30 às 17h.'),
  ('aduferpe', 'ADUFERPE', 'ADUFERPE', 'apoio', 'publicado', -8.0180939, -34.9503556, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Associação dos Docentes da UFRPE. Fica logo na entrada do campus, antes de chegar ao Prédio Central. Espaço independente com auditório para assembleias, salas de reuniões e suporte jurídico para os professores.'),
  ('sintufepe', 'SINTUFEPE', 'SINTUFEPE', 'apoio', 'publicado', -8.0172202, -34.9508772, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Seção UFRPE do sindicato dos técnicos administrativos. Fica nas margens da rua principal de acesso ao campus e abriga a diretoria, o setor jurídico e um auditório próprio para as assembleias gerais da categoria.'),
  ('prefeitura-universitaria', 'Prefeitura Universitária (Secretaria de Infraestrutura e Serviços)', 'Prefeitura', 'apoio', 'publicado', -8.0197973, -34.9484900, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Superintendência de Infraestrutura e Logística: área de serviços internos que engloba a Secretaria de Infraestrutura e Serviços e o Departamento de Logística e Serviços. Fica nos fundos do campus, próximo às garagens de ônibus institucionais e oficinas de manutenção.'),

  -- Moradia estudantil
  ('casa-maria-de-fatima', 'Casa Maria de Fátima', null, 'moradia', 'publicado', -8.0168305, -34.9511314, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Casa de moradia estudantil destinada somente ao público feminino.'),
  ('casa-samyr-pessoa', 'Casa Samyr Pessoa', null, 'moradia', 'rascunho', null, null, null, null,
   'Casa de moradia estudantil mista, voltada para os alunos da pós-graduação e alunos em mobilidade acadêmica temporária.'),
  ('condominio-luiz-gonzaga', 'Condomínio Luiz Gonzaga', null, 'moradia', 'publicado', -8.0158903, -34.9438836, 'Google Places (docs/coordenadas_ufrpe.docx)', null,
   'Prédio de três andares, misto, destinado a moradia estudantil: térreo para o público feminino, 1º andar para o público feminino e masculino, 2º e 3º andar para o público masculino.');

-- Departamentos citados nominalmente nos documentos (cada um aponta para o prédio onde funciona). Só nome e sigla:
-- não há fonte no repositório para coordenação, cursos ou contatos, e esses dados não foram inventados.
insert into public.departments (name, short_name, place_id)
select d.name, d.short_name, p.id
from (values
  ('Departamento de Computação', 'DC', 'dc'),
  ('Departamento de Química', 'DQ', 'quimica'),
  ('Departamento de Educação', null, 'educacao'),
  ('Departamento de Educação Física', 'DEF', 'def'),
  ('Departamento de Qualidade de Vida', 'DQV', 'dqv'),
  ('Ciências Sociais', 'DECISO', 'ariano-suassuna'),
  ('Departamento de História', null, 'ariano-suassuna'),
  ('Departamento de Administração', null, 'ariano-suassuna'),
  ('Departamento de Letras', null, 'ariano-suassuna')
) as d (name, short_name, place_slug)
join public.places p on p.slug = d.place_slug;
