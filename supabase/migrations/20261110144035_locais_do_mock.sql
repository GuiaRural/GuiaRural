-- Locais que existiam só no mock do frontend (data/mockPlaces.ts) e não estavam em places: RU, Hospital Veterinário,
-- as duas portarias e o Auditório Multiuso (rascunho). Os demais locais do mock (reitoria, biblioteca, ceagri-1, dc,
-- agronomia, medvet) já vêm do seed oficial (20261029135659) e valem o que está lá: endereço, horário e contato do mock
-- são dados de exemplo e não foram copiados. O mock também tinha "dzo", que duplica "zootecnia" do seed e fica de fora.
--
-- As coordenadas deste arquivo vêm do OpenStreetMap, anotadas no próprio mock, e NÃO foram conferidas em campo.
-- Endereço, horário, acessibilidade e descrição também vêm do mock: confirmar com a UFRPE e corrigir pelo painel.
--
-- Idempotente: "on conflict (slug) do nothing" e o update só mexe em place_id nulo, então rodar de novo não muda nada.

insert into public.places
    (slug, name, short_name, category, status, latitude, longitude, coordinates_source, address, hours, description, accessibility)
values
    ('ru', 'Restaurante Universitário', 'RU', 'alimentacao', 'publicado', -8.014052, -34.951108,
     'OpenStreetMap, way 681756785 (mock do frontend; conferir em campo)',
     'Próximo à quadra poliesportiva', '11:00-14:00, 17:30-19:30',
     'Refeições subsidiadas para estudantes, servidores e visitantes. Cardápio publicado semanalmente.',
     array['rampa', 'banheiro', 'piso_tatil']),
    ('hovet', 'Hospital Veterinário', 'HOVET', 'saude', 'publicado', -8.014845, -34.948780,
     'OpenStreetMap, way 249468549 (mock do frontend; conferir em campo)',
     'Campus Dois Irmãos — área de Veterinária', '08:00-17:00',
     'Atendimento clínico e cirúrgico de animais, vinculado ao ensino de Medicina Veterinária.',
     array['rampa', 'vaga']),
    ('portaria-principal', 'Portaria Principal (Av. Dom Manoel de Medeiros)', 'Portaria 1', 'portaria', 'publicado', -8.016542, -34.950887,
     'OpenStreetMap, node 9172032456 (mock do frontend; conferir em campo)',
     'Rua Dom Manoel de Medeiros', '00:00-23:59',
     'Entrada principal do campus, com parada de ônibus em frente.',
     array['rampa', 'piso_tatil']),
    ('portaria-dois-irmaos', 'Portaria Dois Irmãos', 'Portaria 2', 'portaria', 'publicado', -8.016355, -34.945249,
     'OpenStreetMap, node 8942620279 (mock do frontend; provável, conferir em campo)',
     'Lado do Parque Dois Irmãos', '06:00-22:00',
     'Entrada secundária, próxima à área de Veterinária.',
     array['rampa']),
    -- Rascunho e sem posição: só aparece no mapa depois de georreferenciado (RN-UC14.01).
    ('auditorio-novo', 'Auditório Multiuso', 'Auditório', 'auditorio', 'rascunho', null, null,
     null,
     null, '08:00-22:00',
     'Cadastro em andamento.',
     array['rampa'])
on conflict (slug) do nothing;

-- A migration do guia (20261109133906) deixou estes dois tópicos sem local porque ru e portaria-principal ainda não
-- existiam. Agora existem: liga cada tópico ao seu local, só se ainda estiver sem vínculo.
update public.guide_topics
   set place_id = (select id from public.places where slug = 'ru')
 where slug = 'beneficios' and place_id is null;

update public.guide_topics
   set place_id = (select id from public.places where slug = 'portaria-principal')
 where slug = 'chegada-transporte' and place_id is null;
