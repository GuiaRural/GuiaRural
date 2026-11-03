'use client';

import React from 'react';
import { 
  Bookmark, MapPin, Compass, CreditCard, Bus, Smartphone, LifeBuoy 
} from 'lucide-react';

interface GuideCardProps {
  category: string;
  categoryBg: string;
  distance: string;
  image: string;
  title: string;
  location: string;
  description: string;
  highlights: { label: string; value: string }[];
}

function GuideCard({
  category,
  categoryBg,
  distance,
  image,
  title,
  location,
  description,
  highlights,
}: GuideCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm transition hover:shadow-md">
      {/* Banner Superior com Imagem */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider ${categoryBg}`}>
            {category}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          {distance}
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <Bookmark size={18} />
            </button>
          </div>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            {location}
          </p>

          <p className="mt-3 text-xs leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

        {/* Destaques sem corte de texto */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {highlights.map((h, index) => (
            <div key={index} className="flex flex-col bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 font-medium uppercase">{h.label}</span>
              <span className="text-xs font-semibold text-slate-800 leading-snug break-words">
                {h.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GuiaDeRecifePage() {
  const cards: GuideCardProps[] = [
    {
      category: 'HISTÓRIA & CULTURA',
      categoryBg: 'bg-amber-600',
      distance: 'Zona Central • 14km',
      image: 'https://t4.ftcdn.net/jpg/05/15/08/73/360_F_515087389_kjWEPvmhIUUII2POmPYtfwIxEHkP4hCC.jpg',
      title: 'Marco Zero & Bairro do Recife Antigo',
      location: 'Praça Barão do Rio Branco, Bairro do Recife',
      description: 'O coração histórico e cultural do Recife, cercado por importantes casarões coloniais, esculturas de Francisco Brennand no molhe portuário e a emblemática rosa dos ventos.',
      highlights: [
        { label: 'PONTOS CONECTADOS', value: 'Cais do Sertão, Paço do Frevo' },
        { label: 'ACESSO & INGRESSOS', value: 'Praça Livre • Museus com Meia' }
      ]
    },
    {
      category: 'ARTE & PATRIMÔNIO',
      categoryBg: 'bg-yellow-500',
      distance: '15 min de Uber da UFRPE',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwvEmLf8p3I4bGavcHOINLSSXr2XIn6sHGicIhtH8zjMJBkPmXRRyDAlg&s=10',
      title: 'Instituto Ricardo Brennand (IRB)',
      location: 'Alameda Antônio Brennand - Várzea',
      description: 'Eleito um dos melhores museus de toda a América Latina, está situado bem próximo à UFRPE. Abriga a maior coleção mundial de telas de Frans Post e armas medievais.',
      highlights: [
        { label: 'DESCONTO ESTUDANTES', value: 'Meia-entrada com comprovante' },
        { label: 'ACERVO CHAVE', value: 'Castelo São João, Pinacoteca' }
      ]
    },
    {
      category: 'LAZER & NATUREZA',
      categoryBg: 'bg-cyan-600',
      distance: 'Zona Sul • 18km',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHVsPTS6zoU8qcUO7GTmkvcUv8k6LFDG483ZS2aGZhgfsrbVMtL428jHY&s=10',
      title: 'Praia de Boa Viagem',
      location: 'Avenida Boa Viagem, Zona Sul',
      description: 'O principal cartão-postal praiano de Recife com 8km de calçadão panorâmico, ciclovias protegidas e quiosques tradicionais de água de coco fresca.',
      highlights: [
        { label: 'DESTAQUES', value: 'Feirinha de Boa Viagem e Gastronomia' },
        { label: 'DICA DE SEGURANÇA', value: 'Banho só na maré baixa em arrecifes' }
      ]
    },
    {
      category: 'PATRIMÔNIO MUNDIAL UNESCO',
      categoryBg: 'bg-red-600',
      distance: 'Olinda • 17km da UFRPE',
      image: 'https://www.voltologo.net/wp-content/uploads/2019/11/o-que-fazer-em-olinda-com-chuva.jpg',
      title: 'Sítio Histórico de Olinda (Alto da Sé)',
      location: 'Largo da Sé e Ladeiras de Olinda',
      description: 'Patrimônio Cultural Mundial, Olinda oferece o por do sol mais espetacular de Pernambuco no Alto da Sé e ladeiras ladeadas por casarões brancos do século XVI.',
      highlights: [
        { label: 'PATRIMÔNIO ARQUITETÔNICO', value: 'Mosteiro de São Bento, Carmo' },
        { label: 'MELHOR HORÁRIO', value: '16:00 (Pôr do Sol no Mirante)' }
      ]
    },
    {
      category: 'CULTURA E TRADIÇÃO',
      categoryBg: 'bg-purple-600',
      distance: 'Zona Central • 13km',
      image: 'https://travelterapia.com.br/wp-content/uploads/2019/06/Cais-do-Sert%C3%A3o-divulga%C3%A7%C3%A3o.jpg',
      title: 'Paço do Frevo & Cais do Sertão',
      location: 'Praça do Arsenal, Bairro do Recife',
      description: 'Dois dos museus interativos mais modernos do país. O Paço celebra a salvaguarda e a história do Frevo, enquanto o Cais do Sertão homenageia Luiz Gonzaga e a cultura sertaneja com acervo imersivo.',
      highlights: [
        { label: 'INGRESSOS', value: 'Entrada gratuita às terças-feiras' },
        { label: 'LOCALIZAÇÃO', value: 'Próximo à Praça do Arsenal' }
      ]
    },
    {
      category: 'HISTÓRIA & ARQUITETURA',
      categoryBg: 'bg-amber-700',
      distance: 'Zona Central • 12km',
      image: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QHhHV-b26R_BZ7MaCQ7X1kn3Nb3q1qf099xfK76ebBNPVy772aSPZOMqYBnJ9A5Xw-2CyPTnCOm2bBzln2Pgwxe1_ImMJLqwWvGbC4l5X08vqeK4Pa5C1hwtzBmFjoxPOY124s=s680-w680-h510-rw',
      title: 'Oficina Cerâmica Francisco Brennand',
      location: 'Propriedade Santos Cosme e Damião - Caxangá',
      description: 'Um museu monumental a céu aberto instalado nas ruínas de uma antiga olaria no bairro da Caxangá. Reúne centenas de esculturas, painéis e jardins projetados por Burle Marx.',
      highlights: [
        { label: 'PROXIMIDADE UFRPE', value: 'Apenas 10 min via Caxangá' },
        { label: 'DESTAQUES', value: 'Templo Central e Jardins Burle Marx' }
      ]
    },
    {
      category: 'CULTURA & SOCIEDADE',
      categoryBg: 'bg-emerald-600',
      distance: 'Casa Forte • 4km da UFRPE',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1CLx9igwDMEU9-veVs12v20kpoltknClqcB0M3kIfhoPxu81flY2wz6c&s=10',
      title: 'Museu do Homem do Nordeste (MUHNE)',
      location: 'Avenida 17 de Agosto, Casa Forte',
      description: 'Vinculado à Fundação Joaquim Nabuco (Fundaj), reúne um acervo antropofágico e plural sobre a formação da sociedade nordestina, abordando as matrizes indígena, africana e européia, além da cultura do açúcar e folclore regional.',
      highlights: [
        { label: 'SUPER PRÓXIMO', value: 'Vizinho ao campus (Casa Forte)' },
        { label: 'ENTRADA', value: 'Gratuito / Meia-entrada cultural' }
      ]
    },
    {
      category: 'ARQUITETURA RELIGIOSA',
      categoryBg: 'bg-blue-700',
      distance: 'Santo Antônio • 13km',
      image: 'https://bahia.ws/wp-content/uploads/2012/11/Capela-mor-com-sua-exuberante-talha-dourada-scaled.png',
      title: 'Capela Dourada & Convento de São Francisco',
      location: 'Rua do Imperador, Santo Antônio',
      description: 'Considerada uma das máximas expressões do barroco brasileiro, com talhas de madeira revestidas em ouro puro do século XVIII. Uma parada histórica imperdível no centro da cidade.',
      highlights: [
        { label: 'ESTILO', value: 'Barroco Rococó Pernambucano' },
        { label: 'ENTRADA', value: 'Taxa simbólica de visitação' }
      ]
    },
    {
      category: 'PARQUES & LAZER',
      categoryBg: 'bg-green-600',
      distance: 'Madalena • 7km da UFRPE',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXHCHJ4jhnK7h6NygCjG2fooUGLKimOnquHOyCzvZ2Q8siDFo7RUFI-zM&s=10',
      title: 'Parque das Graças & Beira Rio',
      location: 'Avenida Beira Rio, Zona Norte',
      description: 'Novo parque linear às margens do Rio Capibaribe com pistas de caminhada, mirantes flutuantes, aluguel de quadras e espaços para piquenique, muito freqüentado ao pôr do sol.',
      highlights: [
        { label: 'ATIVIDADES', value: 'Corrida, bike, skate e piquenique' },
        { label: 'ACESSO', value: 'Gratuito e aberto 24h' }
      ]
    },
    {
      category: 'LAZER & NATUREZA',
      categoryBg: 'bg-green-600',
      distance: 'Zona Norte • 6km da UFRPE',
      image: 'https://alugueldecarrosrecife.com.br/wp-content/uploads/2016/05/parque-da-jaqueira1.jpg',
      title: 'Parque da Jaqueira & Parque da Tamarineira',
      location: 'Rua do Futuro / Av. Rosa e Silva - Zona Norte',
      description: 'Os principais pulmões verdes e refúgios de lazer da Zona Norte. A Jaqueira conta com pista de cooper, ciclovia, pista de skate e aluguel de bikes, enquanto o vizinho Parque da Tamarineira oferece amplas áreas arborizadas e patrimônio arquitetônico histórico.',
      highlights: [
        { label: 'ATIVIDADES', value: 'Caminhada, skate, corrida e piquenique' },
        { label: 'PROXIMIDADE', value: 'Apenas 10 min de ônibus/Uber da UFRPE' }
      ]
    },
    {
      category: 'COMPRAS & GASTRONOMIA',
      categoryBg: 'bg-blue-600',
      distance: 'Pina • 15km da UFRPE',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkdjlnRtQ4EVYMLGAZGUE-bobbM2mU6YYwCDcyKlk_ffneRTCY1dXgoMw&s=10',
      title: 'Shopping RioMar Recife',
      location: 'Av. República do Líbano, Pina',
      description: 'Um dos maiores e mais modernos centros de compras e entretenimento da América Latina. Oferece um Polo Gastronômico diversificado, salas de cinema de última geração, teatro e vista panorâmica para o Rio Capibaribe e bacia do Pina.',
      highlights: [
        { label: 'DESTAQUES', value: 'Polo Gastronômico, Cinemas e Varanda' },
        { label: 'ESTRUTURA', value: 'Centro de convenções e serviços' }
      ]
    },
    {
      category: 'COMPRAS & ENTRETENIMENTO',
      categoryBg: 'bg-sky-600',
      distance: 'Boa Viagem • 17km da UFRPE',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRrDLoCtGfO0alBuIoq2Bwk3CbUzGNtgK1uuXh-VNx0w&s=10',
      title: 'Shopping Recife',
      location: 'Rua Padre Carapuceiro, Boa Viagem',
      description: 'Pioneiro no Estado, o Shopping Recife é um gigante centro comercial com mais de 450 lojas, parque de esculturas ao ar livre, praças de alimentação variadas e complexo de cinemas. Ponto de referência e conveniência na Zona Sul.',
      highlights: [
        { label: 'VARIEDADE', value: 'Mais de 450 lojas e serviços' },
        { label: 'LAZER', value: 'Parque ao ar livre e complexo de cinema' }
      ]
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] p-6 lg:p-10 overflow-y-auto">
      {/* Banner Principal */}
      <div className="relative w-full rounded-3xl bg-[#0B1A30] p-8 lg:p-10 text-white shadow-xl overflow-hidden mb-8">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Guia de Recife • Conheça a Cidade Além do Campus
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Selecionamos os pontos culturais, históricos e itinerários mais emblemáticos da capital pernambucana e arredores.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-10 opacity-10 pointer-events-none">
          <Compass size={280} />
        </div>
      </div>

      {/* Grid com Todos os Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto mb-10">
        {cards.map((card, index) => (
          <GuideCard key={index} {...card} />
        ))}
      </div>

      {/* Seção: Dicas Essenciais para Estudantes na RMR */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span className="p-2 bg-amber-100 text-amber-700 rounded-xl text-sm">💡</span>
              Dicas Essenciais para Estudantes na RMR
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Facilitando sua circulação autónoma por Recife, Olinda e Região Metropolitana.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            CONVÊNIOS & PARCERIAS UFRPE ATIVAS
          </div>
        </div>

        {/* Três Cards Informativos da Seção de Dicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-50/50 border border-amber-100/80 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard size={15} className="text-amber-700" /> Cartão VEM Estudantil
              </h3>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Garante 50% de desconto na tarifa do Grande Recife Consórcio ou passe livre (conforme critérios do Passe Livre). Solicite o atestado de matrícula no portal SIGA da UFRPE e valide nos postos de atendimento ou online pelo app oficial.
              </p>
            </div>
            <a href="#" className="mt-3 text-[11px] font-bold text-amber-800 hover:underline inline-flex items-center gap-1">
              Passo a passo no SIGA &rarr;
            </a>
          </div>

          <div className="bg-amber-50/50 border border-amber-100/80 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bus size={15} className="text-amber-700" /> Integração no TI Macaxeira
              </h3>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                O Terminal Integrado da Macaxeira é o nó central de transporte mais próximo do campus Dois Irmãos. A partir dele, você tem baldeação sem custo adicional para a Zona Norte, Joana Bezerra (metrô), CDU, Tancredo Neves e Olinda (TI PE-15).
              </p>
            </div>
            <a href="#" className="mt-3 text-[11px] font-bold text-amber-800 hover:underline inline-flex items-center gap-1">
              Ver linhas circulares da UFRPE &rarr;
            </a>
          </div>

          <div className="bg-amber-50/50 border border-amber-100/80 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone size={15} className="text-amber-700" /> Apps Recomendados
              </h3>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Instale o Cittamobi Recife para previsão de horários em tempo real dos ônibus que passam na guarita da UFRPE. Cadastre-se no Bike PE (com tarifas subsidiadas para estudantes da rede pública) com estação na entrada principal.
              </p>
            </div>
            <a 
              href="https://www.cittamobi.com.br/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-3 text-[11px] font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
            >
              App CittaMobi &rarr;
            </a>
          </div>
        </div>

        {/* Faixa Inferior de Suporte Estudantil */}
        <div className="bg-slate-100/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-600 text-[11px] flex items-center gap-2">
            <LifeBuoy size={16} className="text-amber-600 shrink-0" />
            Precisa de auxílio de deslocamento ou apoio à moradia estudantil? Procure a <strong>PROGEST / DACS</strong> no Prédio Central.
          </p>
          <button className="whitespace-nowrap px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition shrink-0">
            Falar com Apoio ao Estudante
          </button>
        </div>
      </div>

      {/* Rodapé da Página */}
      <footer className="max-w-7xl mx-auto pt-4 pb-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 border-t border-slate-200/60">
        <div>
          <span className="font-bold text-slate-600">GuiaRural • UFRPE</span> — Plataforma Aberta de Mobilidade & Cidadania Universitária
        </div>
        <div>
          Universidade Federal Rural de Pernambuco • Pró-Reitoria de Assuntos Estudantis
        </div>
      </footer>
    </div>
  );
}