-- D7: não existe tela de contato dedicada; o CTA antigo apontava para uma rota removida.
update public.guide_support_banners
set cta_label_pt = null,
    cta_label_en = null,
    cta_label_es = null,
    cta_href = null
where slug = 'recife'
  and cta_href = '/contato';
