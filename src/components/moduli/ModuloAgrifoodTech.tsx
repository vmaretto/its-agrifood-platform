// @ts-nocheck
import React, { useState, useEffect } from 'react';

// ============================================
// COMPONENTI RIUTILIZZABILI
// ============================================

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, 16);
    return () => clearTimeout(timer);
  }, [isVisible, end, duration]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return <span>{prefix}{count}{suffix}</span>;
};

// Progress Bar Component
const ProgressBar = ({ value, color = '#059669', label, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Stats Grid Component
const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4">
    {stats.map((stat, idx) => (
      <div key={idx} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-3xl mb-2">{stat.icon}</div>
        <div className="text-2xl font-bold text-gray-800">
          <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
        </div>
        <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
      </div>
    ))}
  </div>
);

// Video Card Component con Thumbnail
const VideoCard = ({ title, source, duration, url, thumbnail, language, thumbnailColor }) => {
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Colori gradient per thumbnail placeholder
  const gradients = {
    blue: 'from-blue-600 to-indigo-800',
    green: 'from-emerald-600 to-teal-800',
    red: 'from-red-600 to-rose-800',
    purple: 'from-purple-600 to-indigo-800',
    amber: 'from-amber-500 to-orange-700',
    gray: 'from-gray-700 to-gray-900'
  };

  const gradient = gradients[thumbnailColor] || gradients.gray;

  return (
    <div onClick={handleClick} className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500 transition-all">
      <div className="relative aspect-video bg-gray-800">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${gradient}`}>
            <span className="text-4xl mb-2">🎬</span>
            <span className="text-white/60 text-xs px-3 text-center line-clamp-2">{source}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {duration && (
            <span className="px-2 py-1 bg-black/80 rounded text-white text-xs">{duration}</span>
          )}
          {language && (
            <span className={`px-2 py-1 rounded text-white text-xs ${language === 'IT' ? 'bg-green-600/80' : 'bg-blue-600/80'}`}>{language}</span>
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="font-medium text-white text-sm line-clamp-2 group-hover:text-red-400 transition-colors">{title}</div>
        <div className="text-gray-400 text-xs mt-1 flex items-center gap-1">
          <span>📺</span> {source}
        </div>
      </div>
    </div>
  );
};

// Suggerimento Lettura/Visione Component
const SuggestionBox = ({ icon, title, children, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    green: 'from-emerald-50 to-teal-50 border-emerald-200',
    purple: 'from-purple-50 to-pink-50 border-purple-200',
    amber: 'from-amber-50 to-orange-50 border-amber-200'
  };

  return (
    <div className={`bg-gradient-to-r ${colors[color]} rounded-2xl p-5 border`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{children}</p>
        </div>
      </div>
    </div>
  );
};

// Video Correlati Component
const RelatedVideos = ({ videos }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <SectionHeader icon="📺" title="Video Correlati (altre slide)" />
    <div className="grid grid-cols-3 gap-4">
      {videos.map((video, idx) => (
        <div key={idx} className="p-3 bg-gray-50 rounded-lg text-center hover:bg-gray-100 cursor-pointer transition-colors">
          <span className="text-2xl block mb-2">{video.icon}</span>
          <span className="text-sm text-gray-600">{video.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// Fonti Istituzionali Component
const InstitutionalSources = ({ sources }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <SectionHeader icon="🏛️" title="Fonti Istituzionali" />
    <div className="grid grid-cols-4 gap-4">
      {sources.map((source, idx) => (
        <a
          key={idx}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="text-3xl">{source.icon}</span>
          <span className="text-sm font-medium text-gray-700 text-center">{source.name}</span>
        </a>
      ))}
    </div>
  </div>
);

// Article/PDF Card Component
const ArticleCard = ({ title, source, type, description, url, date }) => {
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const typeConfig = {
    pdf: { icon: '📄', color: 'bg-red-100 text-red-700', label: 'PDF' },
    report: { icon: '📊', color: 'bg-blue-100 text-blue-700', label: 'Report' },
    article: { icon: '📰', color: 'bg-purple-100 text-purple-700', label: 'Articolo' },
    case: { icon: '📋', color: 'bg-amber-100 text-amber-700', label: 'Case Study' },
    guide: { icon: '📖', color: 'bg-green-100 text-green-700', label: 'Guida' }
  };

  const config = typeConfig[type] || typeConfig.article;

  return (
    <div onClick={handleClick} className="group cursor-pointer bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>{config.label}</span>
            {date && <span className="text-xs text-gray-400">{date}</span>}
          </div>
          <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">{title}</div>
          {description && <div className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</div>}
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span>🏢</span> {source}
          </div>
        </div>
        <span className="text-gray-300 group-hover:text-blue-500 transition-colors">↗</span>
      </div>
    </div>
  );
};

// External Link Card Component
const ExternalLinkCard = ({ title, source, url, icon }) => {
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div onClick={handleClick} className="group cursor-pointer flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all">
      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-xl">{icon || '🔗'}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 text-sm group-hover:text-purple-700 transition-colors truncate">{title}</div>
        <div className="text-xs text-gray-500 truncate">{source}</div>
      </div>
      <span className="text-gray-300 group-hover:text-purple-500 transition-colors">→</span>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon, title, count }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    {count && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{count} risorse</span>}
  </div>
);

// Quick Access Buttons Component
const QuickAccessButtons = ({ videos, articles, links, setActiveTab }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <div className="text-sm text-gray-500 mb-3">Approfondisci con:</div>
    <div className="flex gap-3 flex-wrap">
      {videos?.length > 0 && (
        <button onClick={() => setActiveTab('video')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-red-300 hover:bg-red-50 transition-colors">
          <span>🎥</span><span className="text-sm font-medium">{videos.length} Video</span>
        </button>
      )}
      {articles?.length > 0 && (
        <button onClick={() => setActiveTab('articoli')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors">
          <span>📄</span><span className="text-sm font-medium">{articles.length} Articoli/PDF</span>
        </button>
      )}
      {links?.length > 0 && (
        <button onClick={() => setActiveTab('link')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-purple-300 hover:bg-purple-50 transition-colors">
          <span>🔗</span><span className="text-sm font-medium">{links.length} Link</span>
        </button>
      )}
    </div>
  </div>
);

// Mini Quiz Component
const MiniQuiz = ({ question, options, correctIndex, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx) => {
    setSelected(idx);
    setShowResult(true);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <span className="font-semibold text-gray-800">Verifica la comprensione</span>
      </div>
      <p className="text-gray-800 mb-4 font-medium">{question}</p>
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => !showResult && handleSelect(idx)}
            disabled={showResult}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              showResult
                ? idx === correctIndex ? 'bg-emerald-100 border-2 border-emerald-500'
                  : idx === selected ? 'bg-red-100 border-2 border-red-500' : 'bg-white border-2 border-gray-200'
                : 'bg-white border-2 border-gray-200 hover:border-indigo-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                showResult && idx === correctIndex ? 'bg-emerald-500 text-white'
                  : showResult && idx === selected ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}>{String.fromCharCode(65 + idx)}</span>
              <span>{opt}</span>
            </div>
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-lg ${selected === correctIndex ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span>{selected === correctIndex ? '✅' : '💡'}</span>
            <span className="font-semibold">{selected === correctIndex ? 'Corretto!' : 'Non proprio...'}</span>
          </div>
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTI INTERATTIVI PER SLIDE SPECIFICHE
// ============================================

// Supply Chain Diagram (Slide 3)
const SupplyChainDiagram = () => {
  const [activeNode, setActiveNode] = useState(null);
  const nodes = [
    { id: 'campo', label: '🌾', name: 'Campo', description: 'Sensori IoT monitorano umidità, temperatura e stato delle colture in tempo reale', tech: 'IoT Sensors' },
    { id: 'raccolta', label: '🚜', name: 'Raccolta', description: 'Macchine autonome e GPS ottimizzano tempi e percorsi di raccolta', tech: 'Automazione' },
    { id: 'trasformazione', label: '🏭', name: 'Trasformazione', description: 'AI controlla qualità, linee robotiche gestiscono produzione', tech: 'AI + Robotica' },
    { id: 'logistica', label: '🚛', name: 'Logistica', description: 'Blockchain registra ogni passaggio, sensori monitorano temperatura', tech: 'Blockchain' },
    { id: 'retail', label: '🏪', name: 'Retail', description: 'QR code permette al consumatore di vedere l\'intera storia del prodotto', tech: 'QR + App' },
  ];

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-6">
      <div className="text-center mb-4">
        <span className="text-sm text-emerald-600 font-medium">👆 Clicca su ogni nodo per esplorare</span>
      </div>
      <div className="relative h-32">
        <div className="absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 rounded-full" />
        {nodes.map((node, idx) => (
          <div
            key={node.id}
            className={`absolute top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${activeNode === node.id ? 'scale-125 z-10' : 'hover:scale-110'}`}
            style={{ left: `${(idx / (nodes.length - 1)) * 85 + 5}%` }}
            onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all ${activeNode === node.id ? 'bg-emerald-500 text-white shadow-emerald-300' : 'bg-white'}`}>
              {node.label}
            </div>
            <div className="text-xs text-center mt-2 font-medium text-gray-700">{node.name}</div>
          </div>
        ))}
      </div>
      {activeNode && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              {nodes.find(n => n.id === activeNode)?.tech}
            </span>
          </div>
          <p className="text-gray-700">{nodes.find(n => n.id === activeNode)?.description}</p>
        </div>
      )}
    </div>
  );
};

// Farm to Fork Targets (Slide 5)
const FarmToForkTargets = () => {
  const targets = [
    { label: 'Riduzione pesticidi chimici', value: 50, color: '#10b981' },
    { label: 'Riduzione fertilizzanti', value: 20, color: '#06b6d4' },
    { label: 'Terreni agricoli biologici', value: 25, color: '#8b5cf6' },
    { label: 'Riduzione antimicrobici', value: 50, color: '#f59e0b' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🇪🇺</span>
        <span className="font-semibold text-gray-800">Obiettivi Farm to Fork 2030</span>
      </div>
      {targets.map((t, idx) => (
        <ProgressBar key={idx} value={t.value} color={t.color} label={t.label} delay={idx * 200} />
      ))}
      <p className="text-xs text-gray-500 mt-4">Fonte: Strategia Farm to Fork - Green Deal Europeo</p>
    </div>
  );
};

// Blockchain Demo (Slide 7)
const BlockchainDemo = () => {
  const [blocks, setBlocks] = useState([
    { id: 1, label: 'Vendemmia', date: '15 Set 2024', data: 'Uve Sangiovese, Montalcino', verified: true },
    { id: 2, label: 'Pigiatura', date: '16 Set 2024', data: 'Temp: 18°C, Durata: 4h', verified: true },
    { id: 3, label: 'Fermentazione', date: '17 Set 2024', data: '21 giorni, botti acciaio', verified: true },
  ]);
  const [showAdd, setShowAdd] = useState(false);

  const addBlock = () => {
    setShowAdd(true);
    setTimeout(() => {
      setBlocks([...blocks, { id: 4, label: 'Imbottigliamento', date: '10 Mar 2025', data: 'Lotto #2847, 5000 bottiglie', verified: true }]);
      setShowAdd(false);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">⛓️</span>
        <span className="font-semibold">Blockchain - Tracciabilità Vino</span>
      </div>
      <div className="space-y-3">
        {blocks.map((block, idx) => (
          <div key={block.id} className="flex items-center gap-3">
            {idx > 0 && <div className="w-px h-8 bg-emerald-500 ml-4 -mt-5 -mb-5" />}
            <div className="flex-1 bg-slate-700 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-sm font-bold">#{block.id}</div>
              <div className="flex-1">
                <div className="font-medium">{block.label}</div>
                <div className="text-xs text-slate-400">{block.date} • {block.data}</div>
              </div>
              <div className="text-emerald-400">✓</div>
            </div>
          </div>
        ))}
        {showAdd && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-px h-8 bg-amber-500 ml-4" />
            <div className="flex-1 bg-amber-500/20 border-2 border-amber-500 border-dashed rounded-lg p-3">
              <div className="text-amber-400 text-sm">Validazione in corso...</div>
            </div>
          </div>
        )}
      </div>
      {blocks.length < 4 && !showAdd && (
        <button onClick={addBlock} className="mt-4 w-full py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors">
          + Simula nuovo blocco
        </button>
      )}
      <p className="text-xs text-slate-500 mt-4">Ogni blocco è immutabile e collegato crittograficamente al precedente</p>
    </div>
  );
};

// Consumer Preferences (Slide 9)
const ConsumerPreferences = () => {
  const prefs = [
    { label: 'Trasparenza', value: 85, icon: '🔍' },
    { label: 'Autenticità', value: 78, icon: '✨' },
    { label: 'Origine/Territorio', value: 82, icon: '📍' },
    { label: 'Sostenibilità', value: 73, icon: '🌱' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {prefs.map((pref, idx) => (
        <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-3xl mb-2">{pref.icon}</div>
          <div className="text-2xl font-bold text-emerald-600 mb-1">
            <AnimatedCounter end={pref.value} suffix="%" />
          </div>
          <div className="text-sm text-gray-600">{pref.label}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// DATI DELLE SLIDE
// ============================================

// Fonti istituzionali comuni
const INSTITUTIONAL_SOURCES = {
  general: [
    { name: 'ISMEA', icon: '🌾', url: 'https://www.ismea.it' },
    { name: 'ISTAT', icon: '📊', url: 'https://www.istat.it' },
    { name: 'MASAF', icon: '🏛️', url: 'https://www.politicheagricole.it' },
    { name: 'Commissione UE', icon: '🇪🇺', url: 'https://ec.europa.eu/info/food-farming-fisheries' }
  ],
  tech: [
    { name: 'Osservatori PoliMi', icon: '🎓', url: 'https://www.osservatori.net' },
    { name: 'ISMEA', icon: '🌾', url: 'https://www.ismea.it' },
    { name: 'ENEA', icon: '🔬', url: 'https://www.enea.it' },
    { name: 'Commissione UE', icon: '🇪🇺', url: 'https://ec.europa.eu' }
  ],
  wine: [
    { name: 'UIV', icon: '🍷', url: 'https://www.unioneitalianavini.it' },
    { name: 'Federdoc', icon: '📜', url: 'https://www.federdoc.com' },
    { name: 'Federvini', icon: '🍾', url: 'https://www.federvini.it' },
    { name: 'Valoritalia', icon: '✓', url: 'https://www.valoritalia.it' }
  ],
  sustainability: [
    { name: 'MASE', icon: '🌿', url: 'https://www.mase.gov.it' },
    { name: 'Commissione UE', icon: '🇪🇺', url: 'https://ec.europa.eu' },
    { name: 'Symbola', icon: '♻️', url: 'https://www.symbola.net' },
    { name: 'ISPRA', icon: '🔬', url: 'https://www.isprambiente.gov.it' }
  ]
};

const slidesData = [
  // SLIDE 1: INTRO
  {
    id: 'intro',
    section: 'Introduzione',
    title: 'Tendenze AgrifoodTech',
    subtitle: 'Italia e Unione Europea',
    institutionalSources: INSTITUTIONAL_SOURCES.general,
    videoSuggestion: {
      icon: '🎬',
      title: 'Come iniziare',
      text: 'Guarda il video introduttivo di Ambrosetti per avere una panoramica del settore Food & Beverage italiano prima di proseguire con le slide.',
      color: 'blue'
    },
    articleSuggestion: {
      icon: '📖',
      title: 'Lettura consigliata',
      text: 'Il Report Ambrosetti offre una visione strategica completa. Scaricalo e tienilo come riferimento durante tutto il modulo.',
      color: 'green'
    },
    relatedVideos: [
      { icon: '📊', label: 'Slide 2: Contesto settore' },
      { icon: '🔗', label: 'Slide 3: Supply Chain' },
      { icon: '🌱', label: 'Slide 5: Sostenibilità' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌾🚀</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">La Trasformazione Digitale<br />del Settore Agroalimentare</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Un viaggio attraverso le tecnologie, le sfide e le opportunità che stanno ridisegnando il modo in cui produciamo, distribuiamo e consumiamo cibo.</p>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { icon: '🔗', label: 'Supply Chain 4.0' },
            { icon: '🌱', label: 'Sostenibilità' },
            { icon: '🤖', label: 'Automazione' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-medium text-gray-700">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          {[
            { value: '€586,9', label: 'Miliardi filiera agroalimentare', suffix: 'Mld' },
            { value: '3,7', label: 'Milioni di occupati', suffix: 'M' },
            { value: '€2,3', label: 'Miliardi Agricoltura 4.0', suffix: 'Mld' },
            { value: '41', label: 'Aziende digitalizzate', suffix: '%' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-emerald-600">{stat.value}<span className="text-sm">{stat.suffix}</span></div>
              <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    videos: [
      { title: 'Il futuro del Food & Beverage italiano', source: 'Ambrosetti', duration: '10:00', url: 'https://www.youtube.com/watch?v=example', language: 'IT', thumbnailColor: 'blue' }
    ],
    articles: [
      { title: 'La Roadmap del Futuro per il Food & Beverage', source: 'Ambrosetti', type: 'report', description: 'Report strategico 2024-2025 sulla filiera agroalimentare italiana', url: 'https://www.ambrosetti.eu/en/foodretailsustainability-scenario/forum-food/', date: '2024' }
    ],
    links: [
      { title: 'Osservatorio Smart AgriFood', source: 'Politecnico di Milano', url: 'https://www.osservatori.net/smart-agrifood/', icon: '🎓' },
      { title: 'Portale Agroalimentare', source: 'ISMEA', url: 'https://www.ismea.it/', icon: '🌾' }
    ]
  },

  // SLIDE 2: CONTESTO
  {
    id: 'contesto',
    section: 'Contesto',
    title: 'Il Settore in Trasformazione',
    institutionalSources: INSTITUTIONAL_SOURCES.general,
    videoSuggestion: {
      icon: '▶️',
      title: 'Percorso video consigliato',
      text: 'Inizia dal video Ambrosetti per il quadro strategico, poi guarda quello ISMEA per capire come stanno reagendo concretamente le aziende italiane.',
      color: 'blue'
    },
    articleSuggestion: {
      icon: '📖',
      title: 'Ordine di lettura suggerito',
      text: 'Inizia dal Report Ambrosetti per una visione d\'insieme della filiera, poi approfondisci con l\'articolo WineNews per capire come le aziende stanno reagendo operativamente.',
      color: 'green'
    },
    relatedVideos: [
      { icon: '🔗', label: 'Slide 3: Supply Chain intelligente' },
      { icon: '🤖', label: 'Slide 6: Automazione 4.0' },
      { icon: '👥', label: 'Slide 9: Nuovi consumatori' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <p className="text-lg text-gray-700 leading-relaxed">
          Il settore Food & Beverage sta attraversando cambiamenti profondi, spinto da 
          <span className="font-semibold text-emerald-600"> pandemia</span>, 
          <span className="font-semibold text-amber-600"> inflazione</span>, 
          <span className="font-semibold text-red-600"> cambiamento climatico</span> e 
          <span className="font-semibold text-blue-600"> nuove esigenze dei consumatori</span>.
        </p>
        <StatsGrid stats={[
          { icon: '🏭', value: 64, suffix: '%', label: 'Aziende con misure di sostenibilità' },
          { icon: '🏢', value: 100, suffix: '%', label: 'Grandi aziende con piani green' },
          { icon: '⚙️', value: 37.7, suffix: '%', label: 'Focus su innovazione di processo' },
          { icon: '📦', value: 36.8, suffix: '%', label: 'Focus su innovazione di prodotto' },
        ]} />
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-1">
            <span>💡</span>
            <span className="font-semibold text-amber-800">Il "nuovo consumatore"</span>
          </div>
          <p className="text-amber-900 text-sm">Più critico, digitale e curioso. Vuole sapere l'origine e la storia dei prodotti che consuma. Le tecnologie digitali offrono un potenziale ancora in gran parte da sfruttare.</p>
        </div>
      </div>
    ),
    videos: [
      { title: 'La trasformazione digitale del Food & Beverage', source: 'Ambrosetti Forum', duration: '8:24', url: 'https://www.youtube.com/results?search_query=ambrosetti+food+beverage+2024', language: 'IT', thumbnailColor: 'blue' },
      { title: 'Il nuovo consumatore nell\'agroalimentare', source: 'ISMEA', duration: '6:15', url: 'https://www.youtube.com/results?search_query=ismea+consumatore+agroalimentare', language: 'IT', thumbnailColor: 'green' }
    ],
    articles: [
      { title: 'La Roadmap del Futuro per il Food & Beverage', source: 'The European House - Ambrosetti', type: 'report', description: 'Filiera agroalimentare italiana: €586,9 miliardi, 3,7 milioni occupati', url: 'https://lentepubblica.it/buone-pratiche/road-map-futuro-food-beverage/', date: '2024' },
      { title: 'Il settore F&B risponde puntando sulla sostenibilità', source: 'WineNews', type: 'article', description: 'Come le aziende italiane stanno reagendo all\'inflazione', url: 'https://winenews.it/it/alle-difficolta-dellinflazione-il-settore-food-beverage-risponde-puntando-sulla-sostenibilita_560301/', date: '2025' },
      { title: 'Rapporto Competitività Agroalimentare', source: 'ISMEA', type: 'pdf', description: 'Analisi completa: export, consumi, trend di mercato', url: 'https://www.ismea.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/13170', date: '2024' }
    ],
    links: [
      { title: 'Osservatorio Smart AgriFood', source: 'Politecnico di Milano', url: 'https://www.osservatori.net/smart-agrifood/', icon: '🎓' },
      { title: 'Portale Rete Rurale Nazionale', source: 'MASAF', url: 'https://www.reterurale.it/', icon: '🌾' },
      { title: 'Forum Food & Beverage', source: 'TEHA Group', url: 'https://www.ambrosetti.eu/en/foodretailsustainability-scenario/', icon: '🏛️' },
      { title: 'Dati Agroalimentare', source: 'Istat', url: 'https://www.istat.it/it/agricoltura', icon: '📈' }
    ]
  },

  // SLIDE 3: SUPPLY CHAIN
  {
    id: 'supply-chain',
    section: 'Supply Chain',
    title: 'La Filiera Intelligente',
    institutionalSources: INSTITUTIONAL_SOURCES.tech,
    videoSuggestion: {
      icon: '🎯',
      title: 'Video imperdibile',
      text: 'Il video Walmart-IBM mostra in 3 minuti come la blockchain ha ridotto i tempi di tracciabilità da 7 giorni a 2,2 secondi. Un caso concreto che fa capire subito il potenziale.',
      color: 'purple'
    },
    articleSuggestion: {
      icon: '📚',
      title: 'Approfondimento tecnico',
      text: 'La guida degli Osservatori PoliMi è il riferimento più completo: mappa oltre 180 soluzioni blockchain per il food. Perfetta per chi vuole capire lo stato dell\'arte.',
      color: 'blue'
    },
    relatedVideos: [
      { icon: '🏭', label: 'Slide 4: Case study aziendali' },
      { icon: '⛓️', label: 'Slide 7: Blockchain vino' },
      { icon: '📜', label: 'Slide 8: Normative UE' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <p className="text-gray-700 leading-relaxed">
          La <strong>smart supply chain</strong> utilizza IoT, AI e blockchain per ottimizzare ogni fase della filiera, dal campo alla tavola.
        </p>
        <SupplyChainDiagram />
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '📡', title: 'IoT', desc: 'Sensori in campo, magazzini e trasporti' },
            { icon: '🧠', title: 'AI', desc: 'Previsione domanda e ottimizzazione' },
            { icon: '⛓️', title: 'Blockchain', desc: 'Trasparenza e immutabilità dati' },
          ].map((tech, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">{tech.icon}</div>
              <div className="font-semibold text-gray-800">{tech.title}</div>
              <div className="text-sm text-gray-500">{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    quiz: {
      question: 'Quale tecnologia garantisce che i dati della filiera non possano essere modificati retroattivamente?',
      options: ['Internet of Things', 'Intelligenza Artificiale', 'Blockchain', 'Cloud Computing'],
      correctIndex: 2,
      explanation: 'La blockchain registra ogni transazione in blocchi concatenati crittograficamente. Una volta registrato, un dato non può essere alterato senza invalidare l\'intera catena.'
    },
    videos: [
      { title: 'Walmart Food Safety con IBM Food Trust', source: 'IBM', duration: '3:00', url: 'https://mediacenter.ibm.com/media/Walmart%27s+food+safety+solution+using+IBM+Food+Trust+built+on+the+IBM+Blockchain+Platform/1_zwsrls30', language: 'EN', thumbnailColor: 'blue' },
      { title: 'Blockchain per la tracciabilità alimentare', source: 'Osservatori PoliMi', duration: '7:30', url: 'https://www.youtube.com/results?search_query=osservatori+blockchain+food+tracciabilità', language: 'IT', thumbnailColor: 'purple' }
    ],
    articles: [
      { title: 'Tracciabilità Alimentare e Blockchain: guida completa', source: 'Osservatori PoliMi', type: 'guide', description: 'Oltre 180 soluzioni mappate, Italia 3° al mondo per progetti blockchain food', url: 'https://www.osservatori.net/blog/smart-agrifood/tracciabilita-alimentare-blockchain-cose-vantaggi/', date: '2024' },
      { title: 'Blockchain nel settore alimentare: tutte le applicazioni', source: 'Agenda Digitale', type: 'article', description: 'Sostenibilità, Made in Italy, contrasto Italian Sounding, sussidi PAC', url: 'https://www.agendadigitale.eu/documenti/blockchain-perche-e-utile-nel-settore-alimentare-tracciabilita-certificazioni-filiera-tutte-le-applicazioni/', date: '2024' },
      { title: 'L\'uso della blockchain per sicurezza e tracciabilità', source: 'DNV Italia', type: 'article', description: 'Come blockchain riduce il "costo della fiducia" nella filiera', url: 'https://www.dnv.it/article/l-uso-della-blockchain-per-migliorare-la-sicurezza-e-la-tracciabilita-alimentare-246014/', date: '2023' }
    ],
    links: [
      { title: 'IBM Food Trust', source: 'IBM', url: 'https://www.ibm.com/products/supply-chain-intelligence-suite/food-trust', icon: '🔷' },
      { title: 'Hyperledger Fabric', source: 'Linux Foundation', url: 'https://www.hyperledger.org/use/fabric', icon: '⛓️' },
      { title: 'GS1 Standards', source: 'GS1 Italy', url: 'https://www.gs1it.org/', icon: '📊' }
    ]
  },

  // SLIDE 4: VANTAGGI SUPPLY CHAIN
  {
    id: 'supply-chain-vantaggi',
    section: 'Supply Chain',
    title: 'I Vantaggi della Supply Chain 4.0',
    institutionalSources: INSTITUTIONAL_SOURCES.tech,
    videoSuggestion: {
      icon: '🎬',
      title: 'Caso italiano',
      text: 'Il video xFarm-Barilla mostra come un\'azienda italiana leader ha implementato la tracciabilità blockchain sul basilico. Un esempio concreto e replicabile.',
      color: 'green'
    },
    articleSuggestion: {
      icon: '📋',
      title: 'Case study da studiare',
      text: 'Leggi in sequenza: Barilla (italiano, basilico), Nestlé (multinazionale, latte/caffè), Walmart (retail, scala globale). Tre approcci diversi, stesso obiettivo.',
      color: 'amber'
    },
    relatedVideos: [
      { icon: '🔗', label: 'Slide 3: Come funziona la supply chain' },
      { icon: '⛓️', label: 'Slide 7: Blockchain nel vino' },
      { icon: '🌱', label: 'Slide 5: Sostenibilità' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔍</span>
                <span className="font-semibold text-gray-800">Tracciabilità end-to-end</span>
              </div>
              <p className="text-gray-600 text-sm">Ogni prodotto seguito dal campo al punto vendita. Risalire al lotto in caso di allerte, certificare l'origine di un vino pregiato.</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📉</span>
                <span className="font-semibold text-gray-800">Meno sprechi</span>
              </div>
              <p className="text-gray-600 text-sm">Gestione data-driven che ottimizza scorte in base alla domanda reale e migliora l'efficienza dei processi.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🤝</span>
                <span className="font-semibold text-gray-800">Trasparenza e fiducia</span>
              </div>
              <p className="text-gray-600 text-sm">Sistema integrato che incrementa la trasparenza verso tutti gli attori, rafforzando la fiducia nei prodotti.</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🛡️</span>
                <span className="font-semibold text-gray-800">Resilienza</span>
              </div>
              <p className="text-gray-600 text-sm">Reazione veloce a imprevisti grazie a informazioni real-time e analytics predittivi.</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏢</span>
            <span className="font-semibold">Chi lo sta già facendo?</span>
          </div>
          <div className="flex gap-6">
            {['Barilla', 'Nestlé', 'Walmart'].map((brand, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>{brand}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">Utilizzano piattaforme blockchain + IoT per tracciare "dal campo alla tavola"</p>
        </div>
      </div>
    ),
    videos: [
      { title: 'Barilla: tracciabilità del basilico con blockchain', source: 'xFarm', duration: '4:30', url: 'https://www.youtube.com/results?search_query=barilla+blockchain+basilico+xfarm', language: 'IT', thumbnailColor: 'green' }
    ],
    articles: [
      { title: 'Pesto Barilla: blockchain per tracciabilità basilico', source: 'Agrifood.Tech', type: 'case', description: '25 aziende agricole, 310 ettari digitalizzati con xFarm e Connecting Food', url: 'https://www.agrifood.tech/blockchain/costruire-la-fiducia-un-barattolo-alla-volta-pesto-barilla-sfrutta-la-blockchain-per-la-tracciabilita-del-basilico/', date: '2023' },
      { title: 'Nestlé Open Blockchain Pilot', source: 'Nestlé Global', type: 'case', description: 'Tracciabilità latte e caffè con IBM Food Trust', url: 'https://www.nestle.com/media/pressreleases/allpressreleases/nestle-open-blockchain-pilot', language: 'EN', date: '2020' },
      { title: 'Passaporto digitale Food Made in Italy', source: 'ESG360', type: 'article', description: 'Progetto Barilla-Cisco-NTT Data con piattaforma ValueGo', url: 'https://www.esg360.it/agrifood/passaporto-digitale-food-made-italy-barilla-cisco-penelope-ntt-data/', date: '2024' },
      { title: 'Walmart Case Study: Food Traceability', source: 'Hyperledger', type: 'case', description: '25+ prodotti tracciati, tracciabilità ridotta da 7 giorni a 2,2 secondi', url: 'https://www.lfdecentralizedtrust.org/case-studies/walmart-case-study', language: 'EN', date: '2019' }
    ],
    links: [
      { title: 'Connecting Food', source: 'Piattaforma blockchain', url: 'https://connecting-food.com/', icon: '🔗' },
      { title: 'xFarm Technologies', source: 'AgTech italiano', url: 'https://xfarm.ag/', icon: '🌱' },
      { title: 'EZ Lab - AgriOpenData', source: 'Startup Padova', url: 'https://www.ezlab.it/', icon: '🔬' }
    ]
  },

  // SLIDE 5: SOSTENIBILITA
  {
    id: 'sostenibilita',
    section: 'Sostenibilità',
    title: 'La Sostenibilità al Centro',
    institutionalSources: INSTITUTIONAL_SOURCES.sustainability,
    videoSuggestion: {
      icon: '🇪🇺',
      title: 'Contesto europeo',
      text: 'Il video della Commissione UE spiega in 5 minuti la strategia Farm to Fork: gli obiettivi 2030 che guideranno tutto il settore. Fondamentale per capire dove stiamo andando.',
      color: 'green'
    },
    articleSuggestion: {
      icon: '📄',
      title: 'Documenti chiave',
      text: 'Scarica il documento ufficiale Farm to Fork e tienilo come riferimento. Poi esplora Equalitas e VIVA per capire le certificazioni specifiche del vino.',
      color: 'green'
    },
    relatedVideos: [
      { icon: '📜', label: 'Slide 8: Normative ESG' },
      { icon: '👥', label: 'Slide 9: Consumatori e bio' },
      { icon: '🏆', label: 'Slide 10: Sfide chiave' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <p className="text-gray-700 leading-relaxed">
          La sostenibilità è un <strong>pilastro strategico</strong> per l'agrifood: l'agricoltura è responsabile di circa <span className="text-red-600 font-bold">1/3 delle emissioni globali</span> di CO₂, e fino al <span className="text-amber-600 font-bold">40% del cibo</span> prodotto nei paesi sviluppati viene sprecato.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <FarmToForkTargets />
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3">🍷 Nel settore vitivinicolo</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✓</span>Vitigni resistenti (PIWI) per ridurre trattamenti chimici</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✓</span>Impianti fotovoltaici in cantina</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✓</span>Bottiglie più leggere, packaging eco</li>
                <li className="flex items-start gap-2"><span className="text-emerald-500 mt-1">✓</span>Certificazioni Equalitas, VIVA</li>
              </ul>
            </div>
            <div className="bg-emerald-600 text-white rounded-xl p-5">
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-emerald-100">delle grandi aziende F&B italiane (+250 addetti) sta intraprendendo azioni concrete per la sostenibilità</div>
            </div>
          </div>
        </div>
      </div>
    ),
    videos: [
      { title: 'Farm to Fork Strategy explained', source: 'European Commission', duration: '5:00', url: 'https://www.youtube.com/results?search_query=farm+to+fork+strategy+european+commission', language: 'EN', thumbnailColor: 'green' },
      { title: 'Agroecologia da vedere - Serie video', source: 'Rete Rurale Nazionale', duration: 'Serie', url: 'https://www.reterurale.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/22464', language: 'IT', thumbnailColor: 'amber' }
    ],
    articles: [
      { title: 'Farm to Fork Strategy - Documento ufficiale', source: 'Commissione Europea', type: 'pdf', description: 'Obiettivi 2030: -50% pesticidi, -20% fertilizzanti, 25% biologico', url: 'https://food.ec.europa.eu/horizontal-topics/farm-fork-strategy_en', date: '2020' },
      { title: 'Agroalimentare Made in Italy e Green Economy', source: 'Symbola', type: 'report', description: 'Italia agricoltura più green d\'Europa: 7,2% emissioni, 307 IG', url: 'https://symbola.net/approfondimento/agroalimentare-italia-green-gi20/', date: '2024' },
      { title: 'Lo standard Equalitas', source: 'Valoritalia', type: 'guide', description: 'Certificazione sostenibilità vino su 3 pilastri: ambiente, sociale, economico', url: 'https://www.valoritalia.it/equalitas/', date: '2024' },
      { title: 'Programma VIVA - Viticoltura Sostenibile', source: 'MASE', type: 'guide', description: '4 indicatori: Aria, Acqua, Vigneto, Territorio. 173 aziende certificate', url: 'https://viticolturasostenibile.org/en/viva-program/', date: '2024' }
    ],
    links: [
      { title: 'Portale Farm to Fork', source: 'European Commission', url: 'https://food.ec.europa.eu/horizontal-topics/farm-fork-strategy_en', icon: '🇪🇺' },
      { title: 'Equalitas', source: 'Standard sostenibilità vino', url: 'https://www.equalitas.it/', icon: '🍷' },
      { title: 'VIVA Sustainable Wine', source: 'Ministero Ambiente', url: 'https://viticolturasostenibile.org/', icon: '🌿' },
      { title: 'SQNPI - Produzione Integrata', source: 'Rete Rurale', url: 'https://www.reterurale.it/produzioneintegrata', icon: '🐝' }
    ]
  },

  // SLIDE 6: AUTOMAZIONE
  {
    id: 'automazione',
    section: 'Automazione',
    title: 'Agricoltura 4.0 e Automazione',
    institutionalSources: INSTITUTIONAL_SOURCES.tech,
    videoSuggestion: {
      icon: '🚜',
      title: 'Vedere per credere',
      text: 'I video John Deere e New Holland mostrano trattori completamente autonomi. Non è fantascienza: sono già in commercio. Impressionanti per capire dove sta andando il settore.',
      color: 'blue'
    },
    articleSuggestion: {
      icon: '📊',
      title: 'I numeri del mercato',
      text: 'Il report Osservatori PoliMi è LA fonte di riferimento: €2,3 miliardi, +500% in 5 anni. Leggi anche il case study vite.net per vedere i risultati concreti (-37% rame).',
      color: 'purple'
    },
    relatedVideos: [
      { icon: '🔗', label: 'Slide 3: IoT nella supply chain' },
      { icon: '⛓️', label: 'Slide 7: Tracciabilità' },
      { icon: '🌱', label: 'Slide 5: Sostenibilità' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
          <div>
            <div className="text-sm opacity-80">Mercato Agricoltura 4.0 in Italia</div>
            <div className="text-4xl font-bold">€2,3 miliardi</div>
            <div className="text-sm opacity-80 mt-1">41% aziende usa almeno 1 soluzione digitale</div>
          </div>
          <div className="text-6xl">🚜</div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '🛰️', title: 'Droni & Satelliti', desc: 'Monitoraggio salute campi, stress idrico, attacchi parassitari' },
            { icon: '🤖', title: 'Macchine Autonome', desc: 'Trattori GPS, robot raccoglitori e trapiantatori' },
            { icon: '📊', title: 'DSS', desc: 'Decision Support Systems per decisioni agronomiche data-driven' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-sm text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="font-semibold text-gray-800 mb-1">{item.title}</div>
              <div className="text-sm text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="bg-indigo-50 rounded-xl p-5">
          <h4 className="font-semibold text-gray-800 mb-3">🧠 AI nella Filiera Agroalimentare</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              'Previsione rese analizzando big data climatici',
              'Visione artificiale per selezione qualità',
              'Individuazione parassiti con machine learning',
              'Controllo qualità automatizzato in cantina'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-indigo-500">→</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    quiz: {
      question: 'Quale vantaggio principale offre l\'uso di modelli previsionali (DSS) in viticoltura?',
      options: ['Aumentare la produzione di uva', 'Pianificare trattamenti solo quando necessari, riducendo l\'uso di chimici', 'Eliminare completamente i parassiti', 'Ridurre il costo della manodopera'],
      correctIndex: 1,
      explanation: 'I modelli previsionali permettono di anticipare attacchi parassitari (come la peronospora) e intervenire in modo mirato solo dove e quando necessario, evitando trattamenti preventivi a tappeto. Risultati: -37% rame applicato.'
    },
    videos: [
      { title: 'John Deere Autonomous Tractor at CES', source: 'John Deere', duration: '5:00', url: 'https://www.youtube.com/results?search_query=john+deere+autonomous+tractor+ces+2022', language: 'EN', thumbnailColor: 'green' },
      { title: 'New Holland NHDrive Autonomous Concept', source: 'CNH Industrial', duration: '3:30', url: 'https://www.youtube.com/results?search_query=new+holland+nhdrive+autonomous', language: 'EN', thumbnailColor: 'amber' }
    ],
    articles: [
      { title: 'Osservatorio Smart AgriFood 2024: mercato a €2,3 miliardi', source: 'Politecnico di Milano', type: 'report', description: '41% aziende usa soluzioni 4.0, 9,5% superficie digitale, crescita AI +24%', url: 'https://www.osservatori.net/comunicato/smart-agrifood/agricoltura-4-0-italia-mercato/', date: '2025' },
      { title: 'Agricoltura 4.0 in Italia: mito o realtà?', source: 'AgroNotizie', type: 'article', description: 'Evoluzione 2019-2024: da €500M a €2,5Mld, +500% in 5 anni', url: 'https://agronotizie.imagelinenetwork.com/agrimeccanica/2024/04/09/agricoltura-40-in-italia-mito-o-realta/81541', date: '2024' },
      { title: 'AI in agricoltura - Agrifood Future 2024', source: 'Terra e Vita', type: 'article', description: 'Classificazione IA, robot raccolta, calibratura, confezionamento', url: 'https://terraevita.edagricole.it/nova/nova-agricoltura-di-precisione/agrifood-future-cosi-lintelligenza-artificiale-entra-in-agricoltura/', date: '2024' },
      { title: 'vite.net® - DSS per viticoltura', source: 'Horta Srl', type: 'case', description: 'Risultati: -37% rame, -30% costi difesa, risparmio 195-300 €/ha/anno', url: 'https://www.horta-srl.it/en/vite-net/', date: '2024' }
    ],
    links: [
      { title: 'Osservatorio Smart AgriFood', source: 'PoliMi', url: 'https://www.osservatori.net/smart-agrifood/', icon: '🎓' },
      { title: 'vite.net - DSS Viticoltura', source: 'Horta', url: 'https://www.horta-srl.it/en/vite-net/', icon: '🍇' },
      { title: 'Agricolus DSS', source: 'Agricolus', url: 'https://www.agricolus.com/', icon: '📊' },
      { title: 'John Deere Precision Ag', source: 'John Deere', url: 'https://www.deere.it/it/campaigns/20-anni-autotrac/', icon: '🚜' }
    ]
  },

  // SLIDE 7: TRACCIABILITA
  {
    id: 'tracciabilita',
    section: 'Tracciabilità',
    title: 'Tracciabilità e Trasparenza',
    institutionalSources: INSTITUTIONAL_SOURCES.wine,
    videoSuggestion: {
      icon: '🍷',
      title: 'Il primo al mondo',
      text: 'Il video Wine Blockchain EY del 2017 mostra il PRIMO progetto blockchain per il vino al mondo, nato in Italia. Un pezzo di storia dell\'innovazione agroalimentare.',
      color: 'purple'
    },
    articleSuggestion: {
      icon: '⚠️',
      title: 'Il problema delle frodi',
      text: 'Leggi il report EUIPO per capire la dimensione del problema (€2,3 miliardi/anno in UE). Poi i case study Wine Blockchain e BinTraWine per vedere le soluzioni italiane.',
      color: 'amber'
    },
    relatedVideos: [
      { icon: '🔗', label: 'Slide 3: Supply chain intelligente' },
      { icon: '🏭', label: 'Slide 4: Case study aziendali' },
      { icon: '📜', label: 'Slide 8: Normative etichettatura' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-1">
            <span>⚠️</span>
            <span className="font-semibold text-red-800">Il problema delle frodi</span>
          </div>
          <p className="text-red-900">Solo in Europa, il mercato dei falsi wine & spirits vale <strong>€2,3 miliardi/anno</strong>. In Italia: €302 milioni di perdite.</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">📱 Soluzioni Digitali</h4>
            {[
              { name: 'QR Code in etichetta', desc: 'Scansiona e vedi l\'intera storia del prodotto' },
              { name: 'NFC/RFID', desc: 'Etichette intelligenti che aggiornano i dati' },
              { name: 'Blockchain', desc: 'Certificazione immutabile dell\'origine' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
          <BlockchainDemo />
        </div>
        <div className="bg-emerald-50 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">74%</div>
              <div className="text-sm text-gray-600">dei consumatori influenzato dalla trasparenza</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">71%</div>
              <div className="text-sm text-gray-600">disposto a pagare di più per prodotti tracciati</div>
            </div>
          </div>
        </div>
      </div>
    ),
    videos: [
      { title: 'Wine Blockchain EY - Primo progetto al mondo', source: 'EY Italia', duration: '5:00', url: 'https://www.youtube.com/watch?v=d3QGvjPYFAw', language: 'IT', thumbnailColor: 'purple' },
      { title: 'My Story DNV - Blockchain per il vino', source: 'DNV', duration: '4:00', url: 'https://www.youtube.com/results?search_query=dnv+my+story+wine+blockchain', language: 'IT', thumbnailColor: 'blue' }
    ],
    articles: [
      { title: 'Wine Blockchain EY - Cantina Volpone', source: 'Blockchain4Innovation', type: 'case', description: 'Primo progetto al mondo (2017) con EZ Lab. Falanghina DOC tracciata dalla vigna alla tavola', url: 'https://www.blockchain4innovation.it/mercati/agrifood/blockchain-la-smart-agrifood-ey-presenta-wine-blockchain-difesa-del-vino-made-italy/', date: '2017' },
      { title: 'BinTraWine: tracciabilità filiera vitivinicola', source: 'ATON IT / Sapienza', type: 'case', description: 'Piattaforma blockchain per DOC/BIO con Consorzio Frascati', url: 'https://bintrawine.atoninformatica.it/', date: '2024' },
      { title: 'Economic Cost of IPR Infringement Wine & Spirits', source: 'EUIPO', type: 'pdf', description: '€2,3 miliardi perdite UE, 5.700 posti lavoro persi, €2 miliardi gettito fiscale perso', url: 'https://euipo.europa.eu/ohimportal/en/web/observatory/ipr_infringement_wines_and_spirits', language: 'EN', date: '2020' },
      { title: 'Guida etichettatura vini UE 2023', source: 'Unione Italiana Vini', type: 'guide', description: 'Regolamento 2021/2117: ingredienti, valori nutrizionali, QR code', url: 'https://www.unioneitalianavini.it/approfondimenti-tematici/news/etichettatura-e-ingredienti-del-vino-quali-sono-le-norme-da-seguire', date: '2023' }
    ],
    links: [
      { title: 'BinTraWine', source: 'ATON Informatica', url: 'https://bintrawine.atoninformatica.it/', icon: '🍷' },
      { title: 'EZ Lab - AgriOpenData', source: 'Startup Padova', url: 'https://www.ezlab.it/', icon: '🔬' },
      { title: 'Wine e-Labels EU', source: 'Piattaforma etichettatura', url: 'https://wine-elabels.eu/it/', icon: '🏷️' },
      { title: 'EUIPO Observatory', source: 'Anti-contraffazione', url: 'https://euipo.europa.eu/ohimportal/en/web/observatory', icon: '🛡️' }
    ]
  },

  // SLIDE 8: NORMATIVE
  {
    id: 'normative',
    section: 'Normative',
    title: 'Pressioni Normative ed ESG',
    institutionalSources: [
      { name: 'EUR-Lex', icon: '⚖️', url: 'https://eur-lex.europa.eu' },
      { name: 'UIV', icon: '🍷', url: 'https://www.unioneitalianavini.it' },
      { name: 'Commissione UE', icon: '🇪🇺', url: 'https://ec.europa.eu' },
      { name: 'EFSA', icon: '🔬', url: 'https://www.efsa.europa.eu' }
    ],
    videoSuggestion: {
      icon: '📋',
      title: 'Cosa cambia in pratica',
      text: 'Il video UIV spiega in modo chiaro cosa devono fare le aziende vinicole per essere conformi alla nuova etichettatura. Pratico e operativo.',
      color: 'amber'
    },
    articleSuggestion: {
      icon: '⚖️',
      title: 'Documenti normativi',
      text: 'Scarica la guida AEA Consulenze per capire gli obblighi pratici. Il link Wine e-Labels ha le FAQ ufficiali della Commissione UE.',
      color: 'blue'
    },
    relatedVideos: [
      { icon: '🌱', label: 'Slide 5: Sostenibilità e Farm to Fork' },
      { icon: '⛓️', label: 'Slide 7: Tracciabilità e QR code' },
      { icon: '👥', label: 'Slide 9: Cosa vogliono i consumatori' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <p className="text-gray-700">Il settore del vino in Europa è sotto una <strong>doppia spinta</strong>: normativa (nuove regole su trasparenza e ambiente) ed economico-sociale (criteri ESG sempre più richiesti).</p>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><span>📜</span> Novità Normative</h4>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-xs text-blue-600 font-medium mb-1">DAL 8 DIC 2023</div>
              <div className="font-semibold text-gray-800">Etichettatura obbligatoria</div>
              <div className="text-sm text-gray-600">Ingredienti e valori nutrizionali sui vini UE</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl">
              <div className="text-xs text-amber-600 font-medium mb-1">IN ARRIVO</div>
              <div className="font-semibold text-gray-800">Regolamento imballaggi</div>
              <div className="text-sm text-gray-600">Bottiglie più leggere, materiale riciclato</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-xs text-purple-600 font-medium mb-1">FINE 2024</div>
              <div className="font-semibold text-gray-800">Vini dealcolati</div>
              <div className="text-sm text-gray-600">Nuovo decreto per vini a bassa/zero gradazione</div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2"><span>📊</span> Pressioni ESG</h4>
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              {[
                { name: 'Corporate Sustainability Reporting', status: 'Obbligo 2024', color: 'bg-red-100 text-red-700' },
                { name: 'Tassonomia UE attività sostenibili', status: 'In vigore', color: 'bg-amber-100 text-amber-700' },
                { name: 'Due diligence supply chain', status: 'DE/FR attivi', color: 'bg-blue-100 text-blue-700' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
            <div className="bg-emerald-600 text-white p-4 rounded-xl">
              <div className="text-sm opacity-80 mb-1">Chi si muove in anticipo:</div>
              <div className="font-semibold">Mitiga i rischi + ottiene vantaggio competitivo</div>
            </div>
          </div>
        </div>
      </div>
    ),
    videos: [
      { title: 'Nuova etichettatura vini UE: cosa cambia', source: 'UIV', duration: '6:00', url: 'https://www.youtube.com/results?search_query=etichettatura+vini+2023+ingredienti', language: 'IT', thumbnailColor: 'amber' }
    ],
    articles: [
      { title: 'Regolamento UE 2021/2117 - Guida applicativa', source: 'AEA Consulenze', type: 'guide', description: 'Obbligo etichetta digitale via QR code per ingredienti', url: 'https://aeaconsulenzealimentari.it/etichettatura-vini-regolamento-ue-2021-2117-guida-commissione-europea/', date: '2023' },
      { title: 'Sostenibilità e salute: le sfide del vino italiano', source: 'AgroNotizie', type: 'article', description: 'Analisi Vinitaly 2024 su normative ESG e pressioni salutistiche', url: 'https://agronotizie.imagelinenetwork.com/agricoltura-economia-politica/2024/04/22/sostenibilita-e-salute-le-sfide-del-vino-italiano/83751', date: '2024' },
      { title: 'Farm to Fork: riepilogo giuridico', source: 'EUR-Lex', type: 'pdf', description: 'Documento ufficiale con tutti gli obiettivi e le milestone', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=LEGISSUM:4494870', language: 'EN', date: '2024' }
    ],
    links: [
      { title: 'EUR-Lex - Normativa UE', source: 'Unione Europea', url: 'https://eur-lex.europa.eu/', icon: '🇪🇺' },
      { title: 'Wine e-Labels FAQ', source: 'Commissione UE', url: 'https://wine-elabels.eu/it/', icon: '❓' },
      { title: 'Unione Italiana Vini', source: 'Associazione', url: 'https://www.unioneitalianavini.it/', icon: '🍷' },
      { title: 'Federvini', source: 'Associazione', url: 'https://www.federvini.it/', icon: '🍾' }
    ]
  },

  // SLIDE 9: CONSUMATORI
  {
    id: 'consumatori',
    section: 'Consumatori',
    title: 'I Nuovi Consumatori del Vino',
    institutionalSources: [
      { name: 'Nomisma', icon: '📊', url: 'https://www.nomisma.it' },
      { name: 'CENSIS', icon: '🔬', url: 'https://www.censis.it' },
      { name: 'UIV-Vinitaly', icon: '🍷', url: 'https://www.vinitaly.com' },
      { name: 'IWSR', icon: '🌍', url: 'https://www.theiwsr.com' }
    ],
    videoSuggestion: {
      icon: '👶',
      title: 'Capire i giovani',
      text: 'Il video UIV-Vinitaly svela i comportamenti della Gen Z: 56% vede il vino come "fashion statement". Dati sorprendenti che cambiano le strategie di marketing.',
      color: 'purple'
    },
    articleSuggestion: {
      icon: '📈',
      title: 'Dati di mercato',
      text: 'Il Wine Monitor Nomisma è la fonte più autorevole sui consumatori. Il report CENSIS aggiunge il focus sui giovani italiani. Together, danno il quadro completo.',
      color: 'blue'
    },
    relatedVideos: [
      { icon: '📊', label: 'Slide 2: Contesto in trasformazione' },
      { icon: '🌱', label: 'Slide 5: Sostenibilità e bio' },
      { icon: '🏆', label: 'Slide 10: Le sfide chiave' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <p className="text-gray-700">Le preferenze stanno evolvendo: non si cerca solo un buon sapore, ma <strong>certezze e valori</strong> legati al prodotto.</p>
        <div className="grid grid-cols-2 gap-6">
          <ConsumerPreferences />
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-5">
              <div className="text-3xl font-bold mb-1">73%</div>
              <div className="text-emerald-100">degli italiani ritiene che il vino debba rispettare l'ambiente</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-1">52%</div>
              <div className="text-sm text-gray-600">ha preferito vini biologici nell'ultimo anno</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><span>📈</span><span className="font-semibold">Trend in crescita</span></div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Made in Italy: <span className="font-semibold">+7,5%</span></div>
                <div>Prodotti km zero: <span className="font-semibold">+7,8%</span></div>
                <div>Attenzione tracciabilità: <span className="font-semibold">+10,7%</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><span>👶</span><span className="font-semibold text-purple-800">Gen Z e Millennials</span></div>
          <p className="text-sm text-purple-900">Il <strong>56% della Gen Z</strong> italiana vede il vino come "fashion statement". Under 44 = 47% consumatori USA e trainano il segmento Ultra Premium.</p>
        </div>
      </div>
    ),
    quiz: {
      question: 'Qual è la tendenza emergente tra i giovani consumatori di vino?',
      options: ['Bere più vino economico', 'Preferire solo vini francesi', 'Bere meno, ma bere meglio', 'Ignorare le certificazioni'],
      correctIndex: 2,
      explanation: 'Le nuove generazioni tendono a consumare vino con moderazione, preferendo una bottiglia di qualità superiore, sostenibile e autentica, da godersi in occasioni speciali.'
    },
    videos: [
      { title: 'Giovani e vino: nuovi trend di consumo', source: 'UIV-Vinitaly', duration: '7:00', url: 'https://www.youtube.com/results?search_query=giovani+vino+tendenze+vinitaly', language: 'IT', thumbnailColor: 'purple' }
    ],
    articles: [
      { title: 'XI Forum Wine Monitor 2025', source: 'Nomisma', type: 'report', description: 'Mercato vino mondiale, export +4,8%, cambio comportamenti consumatori', url: 'https://www.nomisma.it/press-area/xi-forum-wine-monitor-mercato-del-vino-si-naviga-a-vista/', date: '2025' },
      { title: 'Under 44 sostengono il mercato e spendono di più', source: 'Il Sole 24 Ore / UIV', type: 'article', description: '56% Gen Z vede vino come fashion statement, 47% consumatori USA', url: 'https://en.ilsole24ore.com/art/giovani-e-vino-contrordine-sono-under-44-sostenere-mercato-e-spendere-piu-AGzLM9mD', date: '2025' },
      { title: 'Osservatorio ENPAIA-CENSIS 2024', source: 'CENSIS', type: 'pdf', description: '67,7% giovani consuma vino in compagnia, 63% beve biologico', url: 'https://www.censis.it/sites/default/files/downloads/Report%20Enpaia-Censis%202024%20per%20Vinitaly.pdf', date: '2024' },
      { title: 'Vino biologico: Italia leader mondiale', source: 'Wine Meridian', type: 'article', description: 'Superficie +68% dal 2010, oltre 20% certificata bio', url: 'https://www.winemeridian.com/approfondimenti/mercato-biologico-italia-crescita-consumi-export/', date: '2024' }
    ],
    links: [
      { title: 'Nomisma Wine Monitor', source: 'Ricerche consumatori', url: 'https://www.nomisma.it/servizi/wine-monitor/', icon: '📊' },
      { title: 'IWSR - Global Trends', source: 'Analisi mercato', url: 'https://www.theiwsr.com/', icon: '🌍' },
      { title: 'Wine Enthusiast', source: 'Magazine', url: 'https://www.wineenthusiast.com/', icon: '🍷' },
      { title: 'I Numeri del Vino', source: 'Blog analisi', url: 'https://www.inumeridelvino.it/', icon: '📈' }
    ]
  },

  // SLIDE 10: CONCLUSIONE
  {
    id: 'conclusione',
    section: 'Conclusione',
    title: 'Le 3 Sfide Chiave',
    institutionalSources: INSTITUTIONAL_SOURCES.general,
    videoSuggestion: null,
    articleSuggestion: {
      icon: '🎯',
      title: 'Per approfondire',
      text: 'I tre report conclusivi danno i numeri finali: export, DOP Economy, prospettive. Perfetti per preparare presentazioni o business plan.',
      color: 'green'
    },
    relatedVideos: [
      { icon: '📊', label: 'Slide 1: Panoramica iniziale' },
      { icon: '🔗', label: 'Slide 3: Supply Chain' },
      { icon: '🌱', label: 'Slide 5: Sostenibilità' }
    ],
    content: (setActiveTab) => (
      <div className="space-y-6">
        <p className="text-lg text-gray-700 text-center max-w-2xl mx-auto">Le aziende agroalimentari devono agire su <strong>tre fronti</strong> per prosperare in uno scenario competitivo e in rapida evoluzione.</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: '🔧', title: 'Tecnologia', desc: 'Smart supply chain, automazione, data analytics per efficienza e trasparenza', color: 'from-blue-500 to-indigo-600' },
            { icon: '🌱', title: 'Sostenibilità', desc: 'Non solo compliance normativa, ma opportunità di differenziazione', color: 'from-emerald-500 to-teal-600' },
            { icon: '👥', title: 'Consumatore', desc: 'Ascolto attento: fiducia, qualità autentica e valori etici', color: 'from-purple-500 to-pink-600' }
          ].map((item, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-6 text-center`}>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-white/90 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
          <p className="text-lg">"Chi riuscirà a coniugare <span className="text-emerald-400 font-semibold">tradizione</span> e <span className="text-blue-400 font-semibold">innovazione</span>, raccontando con <span className="text-purple-400 font-semibold">trasparenza</span> la propria eccellenza, sarà in grado di prosperare."</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { value: '€586,9 Mld', label: 'Filiera agroalimentare IT' },
            { value: '€8,1 Mld', label: 'Export vino italiano' },
            { value: '€20,7 Mld', label: 'DOP Economy' },
            { value: '+7,1%', label: 'Crescita export 2024' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-emerald-600">{stat.value}</div>
              <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    videos: [],
    articles: [
      { title: 'Export Agroalimentare 2024', source: 'ISMEA', type: 'report', description: 'Export +7,1%, 34 miliardi €, vino in bottiglia 2,6 miliardi', url: 'https://www.ismea.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/13170', date: '2024' },
      { title: 'DOP Economy: record €20,7 miliardi', source: 'QuiFinanza / ISMEA', type: 'article', description: 'Export DOP/IGP supera €12 miliardi', url: 'https://quifinanza.it/lifestyle/food-economy/economia-dop-export/939963/', date: '2025' },
      { title: 'Export Vino 2024', source: 'Intesa Sanpaolo', type: 'report', description: 'Italia primo produttore mondiale, €8,1 miliardi export', url: 'https://imi.intesasanpaolo.com/it/insights/economind/settore-vitivinicolo-italiano-2024/', date: '2025' }
    ],
    links: [
      { title: 'ISMEA', source: 'Istituto Servizi Mercato Agricolo', url: 'https://www.ismea.it/', icon: '🌾' },
      { title: 'ICE - Made in Italy', source: 'Agenzia Export', url: 'https://www.ice.it/', icon: '🇮🇹' },
      { title: 'Federdoc', source: 'Consorzi tutela', url: 'https://www.federdoc.com/', icon: '🍷' },
      { title: 'Coldiretti', source: 'Associazione agricoltori', url: 'https://www.coldiretti.it/', icon: '🚜' }
    ]
  }
];

// ============================================
// COMPONENTE PRINCIPALE
// ============================================

export default function ModuloAgrifoodTechCompleto({ onBack, isAdmin = false, userRole = 'student', setUserRole }: { onBack?: () => void; isAdmin?: boolean; userRole?: 'student' | 'admin'; setUserRole?: (role: 'student' | 'admin') => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('contenuto');
  const [showQuiz, setShowQuiz] = useState(false);

  const slide = slidesData[currentSlide];
  const progress = ((currentSlide + 1) / slidesData.length) * 100;

  const goNext = () => {
    if (currentSlide < slidesData.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setActiveTab('contenuto');
      setShowQuiz(false);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setActiveTab('contenuto');
      setShowQuiz(false);
    }
  };

  const tabs = [
    { id: 'contenuto', label: 'Contenuto', icon: '📚' },
    { id: 'video', label: 'Video', icon: '🎥', count: slide.videos?.length },
    { id: 'articoli', label: 'Articoli & PDF', icon: '📄', count: slide.articles?.length },
    { id: 'link', label: 'Link Esterni', icon: '🔗', count: slide.links?.length }
  ].filter(tab => tab.id === 'contenuto' || (slide[tab.id === 'video' ? 'videos' : tab.id === 'articoli' ? 'articles' : 'links']?.length > 0));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Torna al percorso
                </button>
              )}
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-semibold text-gray-800">Tendenze AgrifoodTech</div>
                <div className="text-sm text-gray-500">{slide.section}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Toggle Ruolo */}
              {setUserRole && (
                <button
                  onClick={() => setUserRole(userRole === 'student' ? 'admin' : 'student')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    userRole === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span>{userRole === 'admin' ? '👨‍🏫' : '👨‍🎓'}</span>
                  <span>{userRole === 'admin' ? 'Docente' : 'Studente'}</span>
                </button>
              )}
              <div className="text-sm text-gray-500">Slide {currentSlide + 1} di {slidesData.length}</div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* TAB: Contenuto */}
        {activeTab === 'contenuto' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-8 pt-8 pb-4">
                <div className="text-sm text-emerald-600 font-medium mb-2">{slide.section}</div>
                <h2 className="text-2xl font-bold text-gray-800">{slide.title}</h2>
                {slide.subtitle && <p className="text-gray-500 mt-1">{slide.subtitle}</p>}
              </div>
              <div className="px-8 pb-8">
                {typeof slide.content === 'function' ? slide.content(setActiveTab) : slide.content}
              </div>
              
              {/* Quick Access */}
              {(slide.videos?.length > 0 || slide.articles?.length > 0 || slide.links?.length > 0) && (
                <div className="px-8 pb-8">
                  <QuickAccessButtons videos={slide.videos} articles={slide.articles} links={slide.links} setActiveTab={setActiveTab} />
                </div>
              )}

              {/* Quiz Toggle */}
              {slide.quiz && (
                <div className="px-8 pb-8">
                  {!showQuiz ? (
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                      <span>🧠</span><span>Verifica comprensione</span>
                    </button>
                  ) : (
                    <MiniQuiz {...slide.quiz} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Video */}
        {activeTab === 'video' && slide.videos?.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <SectionHeader icon="🎥" title="Video di Approfondimento" count={slide.videos.length} />
              <div className="grid grid-cols-2 gap-6">
                {slide.videos.map((video, idx) => <VideoCard key={idx} {...video} />)}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>💡</span><span>I video si apriranno in una nuova scheda. Durata totale stimata: {slide.videos.reduce((acc, v) => acc + (parseInt(v.duration) || 5), 0)} minuti</span>
                </div>
              </div>
            </div>

            {/* Suggerimento Video */}
            {slide.videoSuggestion && (
              <SuggestionBox icon={slide.videoSuggestion.icon} title={slide.videoSuggestion.title} color={slide.videoSuggestion.color}>
                {slide.videoSuggestion.text}
              </SuggestionBox>
            )}

            {/* Video Correlati */}
            {slide.relatedVideos && <RelatedVideos videos={slide.relatedVideos} />}
          </div>
        )}

        {/* TAB: Articoli */}
        {activeTab === 'articoli' && slide.articles?.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <SectionHeader icon="📄" title="Articoli e Documenti" count={slide.articles.length} />
              <div className="space-y-4">
                {slide.articles.map((article, idx) => <ArticleCard key={idx} {...article} />)}
              </div>
            </div>

            {/* Suggerimento Lettura */}
            {slide.articleSuggestion && (
              <SuggestionBox icon={slide.articleSuggestion.icon} title={slide.articleSuggestion.title} color={slide.articleSuggestion.color}>
                {slide.articleSuggestion.text}
              </SuggestionBox>
            )}
          </div>
        )}

        {/* TAB: Link */}
        {activeTab === 'link' && slide.links?.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <SectionHeader icon="🔗" title="Link per Approfondire" count={slide.links.length} />
              <div className="grid grid-cols-2 gap-3">
                {slide.links.map((link, idx) => <ExternalLinkCard key={idx} {...link} />)}
              </div>
            </div>

            {/* Fonti Istituzionali */}
            {slide.institutionalSources && <InstitutionalSources sources={slide.institutionalSources} />}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={goPrev}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Indietro
          </button>

          <div className="flex gap-2">
            {slidesData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentSlide(idx); setActiveTab('contenuto'); setShowQuiz(false); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-emerald-500 w-6' : idx < currentSlide ? 'bg-emerald-300' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={currentSlide === slidesData.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === slidesData.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            Avanti →
          </button>
        </div>

        {/* Slide Overview */}
        <div className="mt-8 bg-white rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-3">Panoramica modulo</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {slidesData.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentSlide(idx); setActiveTab('contenuto'); setShowQuiz(false); }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-colors ${
                  idx === currentSlide ? 'bg-emerald-100 text-emerald-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.title.length > 25 ? s.title.substring(0, 25) + '...' : s.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
