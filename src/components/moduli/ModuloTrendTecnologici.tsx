// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';

// ============================================
// COMPONENTI RIUTILIZZABILI
// ============================================

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
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return <span>{prefix}{typeof count === 'number' && count % 1 !== 0 ? count.toFixed(1) : count}{suffix}</span>;
};

const ProgressBar = ({ value, color = '#059669', label, delay = 0 }: { value: number; color?: string; label: string; delay?: number }) => {
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

const StatsGrid = ({ stats }: { stats: Array<{ icon: string; value: number; suffix?: string; prefix?: string; label: string }> }) => (
  <div className="grid grid-cols-2 gap-4">
    {stats.map((stat, idx) => (
      <div key={idx} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-3xl mb-2">{stat.icon}</div>
        <div className="text-2xl font-bold text-gray-800">
          <AnimatedCounter end={stat.value} suffix={stat.suffix || ''} prefix={stat.prefix || ''} />
        </div>
        <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
      </div>
    ))}
  </div>
);

const TechCard = ({ title, icon, description, color, stats }: { title: string; icon: string; description: string; color: string; stats?: string }) => (
  <div className={`rounded-xl p-5 ${color} hover:shadow-lg transition-all cursor-pointer`}>
    <div className="text-3xl mb-3">{icon}</div>
    <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    {stats && <div className="text-xs font-semibold text-gray-500 bg-white/50 rounded px-2 py-1 inline-block">{stats}</div>}
  </div>
);

const TimelineItem = ({ year, title, description, icon, isActive }: { year: string; title: string; description: string; icon: string; isActive?: boolean }) => (
  <div className={`flex gap-4 p-4 rounded-xl transition-all ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'bg-gray-50'}`}>
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="text-xs font-bold text-indigo-600 mb-1">{year}</div>
      <div className="font-semibold text-gray-800">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  </div>
);

const VideoCard = ({ title, source, duration, url, thumbnailColor, language }: { title: string; source: string; duration: string; url: string; thumbnailColor?: string; language?: string }) => {
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const gradients: Record<string, string> = {
    blue: 'from-blue-600 to-indigo-800',
    green: 'from-emerald-600 to-teal-800',
    red: 'from-red-600 to-rose-800',
    purple: 'from-purple-600 to-indigo-800',
    amber: 'from-amber-500 to-orange-700',
    gray: 'from-gray-700 to-gray-900'
  };

  const gradient = gradients[thumbnailColor || 'gray'] || gradients.gray;

  return (
    <div onClick={handleClick} className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all">
      <div className="relative aspect-video bg-gray-800">
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${gradient}`}>
          <span className="text-4xl mb-2">🎬</span>
          <span className="text-white/80 text-sm">{source}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <span className="text-indigo-600 text-xl ml-1">▶</span>
          </div>
        </div>
        {language && (
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold ${language === 'IT' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
            {language}
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          {duration}
        </div>
      </div>
      <div className="p-3">
        <div className="text-white font-medium text-sm line-clamp-2">{title}</div>
        <div className="text-gray-400 text-xs mt-1">{source}</div>
      </div>
    </div>
  );
};

const ArticleCard = ({ title, source, type, year, description, url }: { title: string; source: string; type: string; year: string; description?: string; url: string }) => {
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const typeColors: Record<string, string> = {
    'Report': 'bg-blue-100 text-blue-700',
    'PDF': 'bg-red-100 text-red-700',
    'Articolo': 'bg-green-100 text-green-700',
    'Guida': 'bg-purple-100 text-purple-700',
    'Case Study': 'bg-amber-100 text-amber-700',
    'Studio': 'bg-indigo-100 text-indigo-700'
  };

  return (
    <div onClick={handleClick} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📄</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColors[type] || 'bg-gray-100 text-gray-700'}`}>
              {type}
            </span>
            <span className="text-xs text-gray-400">{year}</span>
          </div>
          <div className="font-medium text-gray-800">{title}</div>
          <div className="text-sm text-gray-500">{source}</div>
          {description && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</div>}
        </div>
      </div>
    </div>
  );
};

const ExternalLinkCard = ({ title, source, url, icon }: { title: string; source: string; url: string; icon?: string }) => {
  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div onClick={handleClick} className="p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors flex items-center gap-3">
      <span className="text-xl">{icon || '🔗'}</span>
      <div>
        <div className="font-medium text-gray-800 text-sm">{title}</div>
        <div className="text-xs text-gray-500">{source}</div>
      </div>
    </div>
  );
};

const SuggestionBox = ({ icon, title, text, color }: { icon: string; title: string; text: string; color: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800'
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-semibold mb-1">{title}</div>
          <div className="text-sm opacity-90">{text}</div>
        </div>
      </div>
    </div>
  );
};

const MiniQuiz = ({ question, options, correctIndex, explanation }: { question: string; options: string[]; correctIndex: number; explanation: string }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
  };

  return (
    <div className="bg-indigo-50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🧠</span>
        <span className="font-semibold text-indigo-800">Verifica comprensione</span>
      </div>
      <p className="text-gray-800 mb-4">{question}</p>
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              showResult
                ? idx === correctIndex
                  ? 'bg-green-100 border-2 border-green-500'
                  : idx === selected
                  ? 'bg-red-100 border-2 border-red-500'
                  : 'bg-white border-2 border-gray-200'
                : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
            }`}
          >
            <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {opt}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-3 rounded-lg ${selected === correctIndex ? 'bg-green-100' : 'bg-amber-100'}`}>
          <div className="font-semibold mb-1">
            {selected === correctIndex ? '✅ Corretto!' : '❌ Non esatto'}
          </div>
          <div className="text-sm">{explanation}</div>
        </div>
      )}
    </div>
  );
};

// Diagramma interattivo delle tecnologie emergenti
const TechRadar = ({ technologies }: { technologies: Array<{ name: string; icon: string; maturity: string; color: string }> }) => {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const maturityLevels: Record<string, { ring: number; label: string }> = {
    'mainstream': { ring: 1, label: 'Mainstream' },
    'early-adopter': { ring: 2, label: 'Early Adopter' },
    'emerging': { ring: 3, label: 'Emergente' },
    'frontier': { ring: 4, label: 'Frontier' }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 text-white">
      <h4 className="text-lg font-bold mb-4 text-center">🎯 Tech Radar 2026+</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {technologies.map((tech, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredTech(tech.name)}
            onMouseLeave={() => setHoveredTech(null)}
            className={`p-4 rounded-xl cursor-pointer transition-all ${tech.color} ${
              hoveredTech === tech.name ? 'scale-105 ring-2 ring-white' : ''
            }`}
          >
            <div className="text-2xl mb-2">{tech.icon}</div>
            <div className="font-semibold text-sm">{tech.name}</div>
            <div className="text-xs opacity-80">{maturityLevels[tech.maturity]?.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// DATI DELLE SLIDE
// ============================================

const slidesData = [
  // SLIDE 1: Introduzione
  {
    id: 1,
    section: 'Introduzione',
    title: 'Panoramica Trend Tecnologici 2026+',
    content: {
      mainStats: [
        { icon: '🤖', value: 80, suffix: '%', label: 'Aziende con soluzioni AI' },
        { icon: '🌐', value: 240, suffix: ' Mld€', label: 'Mercato Digital Twin 2032' },
        { icon: '📡', value: 93, suffix: '%', label: 'Agricoltori digitalizzati UE' },
        { icon: '🍷', value: 130, suffix: ' Mld€', label: 'Contributo vino PIL UE' }
      ],
      keyTrends: [
        { name: 'AI Avanzata', icon: '🧠', description: 'Modelli generativi e agenti autonomi', maturity: 'mainstream', color: 'bg-purple-600' },
        { name: 'IoT & Digital Twin', icon: '📊', description: 'Sensori ubiqui e repliche virtuali', maturity: 'early-adopter', color: 'bg-blue-600' },
        { name: 'Blockchain', icon: '⛓️', description: 'Tracciabilità e tokenizzazione', maturity: 'early-adopter', color: 'bg-emerald-600' },
        { name: 'Quantum', icon: '⚛️', description: 'Calcolo quantistico sperimentale', maturity: 'frontier', color: 'bg-pink-600' }
      ]
    },
    videos: [
      { title: 'McKinsey Technology Trends 2025', source: 'McKinsey', duration: '12:00', url: 'https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-top-trends-in-tech', thumbnailColor: 'blue', language: 'EN' },
      { title: 'Top 10 Emerging Technologies 2025', source: 'World Economic Forum', duration: '8:00', url: 'https://www.weforum.org/stories/2025/06/top-10-emerging-technologies-of-2025/', thumbnailColor: 'purple', language: 'EN' }
    ],
    articles: [
      { title: 'Technology Trends Outlook 2025', source: 'McKinsey', type: 'Report', year: '2025', url: 'https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-top-trends-in-tech' },
      { title: 'Gartner Hype Cycle for Emerging Technologies', source: 'Gartner', type: 'Report', year: '2025', url: 'https://www.gartner.com/en/articles/hype-cycle-for-emerging-technologies' },
      { title: 'Top 10 Emerging Technologies', source: 'World Economic Forum', type: 'Report', year: '2025', url: 'https://www.weforum.org/stories/2025/06/top-10-emerging-technologies-of-2025/' }
    ],
    links: [
      { title: 'McKinsey Tech Trends', source: 'mckinsey.com', url: 'https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-top-trends-in-tech', icon: '📊' },
      { title: 'Gartner Hype Cycle', source: 'gartner.com', url: 'https://www.gartner.com/en/articles/hype-cycle-for-emerging-technologies', icon: '📈' },
      { title: 'World Economic Forum', source: 'weforum.org', url: 'https://www.weforum.org/stories/2025/06/top-10-emerging-technologies-of-2025/', icon: '🌍' }
    ],
    videoSuggestion: { icon: '🎯', title: 'Inizia da qui', text: 'I report McKinsey e WEF offrono la visione più completa sui trend tecnologici globali.', color: 'blue' },
    articleSuggestion: { icon: '📚', title: 'Approfondimento consigliato', text: 'Il Gartner Hype Cycle è il riferimento per capire la maturità di ogni tecnologia.', color: 'purple' }
  },

  // SLIDE 2: AI Avanzata
  {
    id: 2,
    section: 'Intelligenza Artificiale',
    title: 'AI Avanzata e Agenti Autonomi',
    content: {
      mainStats: [
        { icon: '🏢', value: 80, suffix: '%', label: 'Aziende con soluzioni AI' },
        { icon: '👔', value: 33, suffix: '%', label: 'CEO con strategia AI agents' },
        { icon: '⏱️', value: 2, suffix: ' anni', label: 'Time-to-market AI agents' },
        { icon: '🔄', value: 100, suffix: '%', label: 'Crescita AI generativa' }
      ],
      aiEvolution: [
        { year: '2023', title: 'AI Generativa', description: 'Esplosione di GPT e modelli text-to-image', icon: '💬' },
        { year: '2024', title: 'Agentic AI', description: 'Agenti che pianificano ed eseguono task multi-step', icon: '🤖' },
        { year: '2025', title: 'Multi-modal AI', description: 'Integrazione testo, immagini, video, audio', icon: '🎭' },
        { year: '2026+', title: 'AI Pervasiva', description: 'AI in ogni processo decisionale aziendale', icon: '🌐' }
      ]
    },
    videos: [
      { title: 'What is Agentic AI?', source: 'IBM Technology', duration: '10:00', url: 'https://www.youtube.com/results?search_query=agentic+ai+explained', thumbnailColor: 'purple', language: 'EN' }
    ],
    articles: [
      { title: 'The State of AI 2025', source: 'McKinsey', type: 'Report', year: '2025', url: 'https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-top-trends-in-tech', description: 'Panoramica completa sullo stato dell\'AI nelle aziende' }
    ],
    links: [
      { title: 'AI Act Europeo', source: 'europa.eu', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', icon: '🇪🇺' },
      { title: 'Anthropic Research', source: 'anthropic.com', url: 'https://www.anthropic.com', icon: '🧠' }
    ],
    hasQuiz: true,
    quiz: {
      question: 'Cosa si intende per "Agentic AI"?',
      options: [
        'AI che genera solo testo',
        'AI che può pianificare ed eseguire compiti multi-step autonomamente',
        'AI per la gestione delle agenzie di viaggio',
        'AI che funziona solo offline'
      ],
      correctIndex: 1,
      explanation: 'L\'Agentic AI rappresenta agenti software in grado di pianificare ed eseguire compiti complessi in più passaggi, con minima supervisione umana.'
    }
  },

  // SLIDE 3: IoT e Digital Twin
  {
    id: 3,
    section: 'IoT & Digital Twin',
    title: 'Internet of Things e Gemelli Digitali',
    content: {
      marketGrowth: [
        { label: 'Mercato Digital Twin 2025', value: 16, color: '#3B82F6' },
        { label: 'Mercato Digital Twin 2032', value: 240, color: '#10B981' }
      ],
      useCases: [
        { title: 'Smart Factory', icon: '🏭', description: 'Manutenzione predittiva e ottimizzazione produzione', color: 'bg-blue-50' },
        { title: 'Smart City', icon: '🌆', description: 'Gestione traffico, energia, rifiuti', color: 'bg-purple-50' },
        { title: 'Digital Earth', icon: '🌍', description: 'Simulazione cambiamenti climatici (Destination Earth UE)', color: 'bg-green-50' },
        { title: 'Precision Farming', icon: '🌾', description: 'Monitoraggio colture e irrigazione smart', color: 'bg-amber-50' }
      ],
      connectivity: [
        { tech: '5G Advanced', status: 'Rollout 2024', icon: '📶' },
        { tech: '6G', status: 'R&D 2025-2030', icon: '🚀' },
        { tech: 'Satelliti LEO', status: 'Espansione globale', icon: '🛰️' }
      ]
    },
    videos: [
      { title: 'What is a Digital Twin?', source: 'Siemens', duration: '5:00', url: 'https://www.youtube.com/results?search_query=digital+twin+explained', thumbnailColor: 'blue', language: 'EN' }
    ],
    articles: [
      { title: 'Digital Twin Statistics 2025', source: 'Hexagon', type: 'Report', year: '2025', url: 'https://hexagon.com/resources/insights/digital-twin/statistics' },
      { title: 'Destination Earth', source: 'Commissione UE', type: 'Guida', year: '2024', url: 'https://digital-strategy.ec.europa.eu/en/policies/destination-earth' }
    ],
    links: [
      { title: 'Destination Earth EU', source: 'europa.eu', url: 'https://destination-earth.eu/', icon: '🌍' },
      { title: 'Hexagon Digital Twin', source: 'hexagon.com', url: 'https://hexagon.com/resources/insights/digital-twin/statistics', icon: '📊' }
    ]
  },

  // SLIDE 4: Blockchain
  {
    id: 4,
    section: 'Blockchain',
    title: 'Blockchain e Infrastrutture Decentralizzate',
    content: {
      applications: [
        { title: 'Supply Chain', icon: '📦', description: 'Tracciabilità prodotti alimentari e lusso', color: 'bg-emerald-50', stats: 'Food, Fashion, Pharma' },
        { title: 'Valute Digitali', icon: '💶', description: 'Euro digitale e CBDC', color: 'bg-blue-50', stats: 'Pilot 2026' },
        { title: 'Tokenizzazione', icon: '🪙', description: 'Asset reali su blockchain', color: 'bg-purple-50', stats: 'Real Estate, Art' },
        { title: 'Identità Digitale', icon: '🆔', description: 'Self-sovereign identity', color: 'bg-amber-50', stats: 'eIDAS 2.0' }
      ],
      benefits: [
        { label: 'Trasparenza', value: 95 },
        { label: 'Sicurezza', value: 90 },
        { label: 'Efficienza', value: 75 },
        { label: 'Interoperabilità', value: 60 }
      ]
    },
    videos: [
      { title: 'Blockchain in Food Supply Chain', source: 'IBM', duration: '6:00', url: 'https://www.youtube.com/results?search_query=blockchain+food+traceability', thumbnailColor: 'green', language: 'EN' }
    ],
    articles: [
      { title: 'Blockchain for Food Traceability', source: 'EU JRC', type: 'Report', year: '2024', url: 'https://publications.jrc.ec.europa.eu/' }
    ],
    links: [
      { title: 'Euro Digitale BCE', source: 'ecb.europa.eu', url: 'https://www.ecb.europa.eu/paym/digital_euro/html/index.en.html', icon: '💶' },
      { title: 'eIDAS 2.0', source: 'europa.eu', url: 'https://digital-strategy.ec.europa.eu/en/policies/eidas-regulation', icon: '🆔' }
    ]
  },

  // SLIDE 5: AR/VR e Metaverso
  {
    id: 5,
    section: 'Realtà Immersiva',
    title: 'AR, VR e Metaverso',
    content: {
      maturityLevel: {
        current: 2,
        max: 5,
        label: 'Adozione enterprise AR/VR'
      },
      applications: [
        { title: 'Training VR', icon: '🎓', description: 'Formazione immersiva del personale', color: 'bg-purple-50' },
        { title: 'Design 3D', icon: '✏️', description: 'Progettazione collaborativa virtuale', color: 'bg-blue-50' },
        { title: 'Retail AR', icon: '🛒', description: 'Prova prodotti in realtà aumentata', color: 'bg-pink-50' },
        { title: 'Metaverso B2B', icon: '🌐', description: 'Showroom e meeting virtuali', color: 'bg-green-50' }
      ],
      futureDevices: [
        { name: 'Apple Vision Pro', year: '2024', status: 'Lancio' },
        { name: 'Meta Quest 4', year: '2025', status: 'Atteso' },
        { name: 'AR Glasses Leggeri', year: '2026+', status: 'In sviluppo' }
      ]
    },
    videos: [
      { title: 'The Future of AR/VR', source: 'MIT Technology Review', duration: '8:00', url: 'https://www.youtube.com/results?search_query=future+of+AR+VR+2025', thumbnailColor: 'purple', language: 'EN' }
    ],
    articles: [
      { title: 'Metaverse: Beyond the Hype', source: 'McKinsey', type: 'Report', year: '2024', url: 'https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/value-creation-in-the-metaverse' }
    ],
    links: [
      { title: 'McKinsey Metaverse', source: 'mckinsey.com', url: 'https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/value-creation-in-the-metaverse', icon: '🌐' }
    ]
  },

  // SLIDE 6: Robotica
  {
    id: 6,
    section: 'Automazione',
    title: 'Robotica e Automazione Avanzata',
    content: {
      robotTypes: [
        { title: 'Robot Industriali', icon: '🦾', description: 'Cobot e sistemi flessibili', color: 'bg-blue-50', stats: 'Manifattura matura' },
        { title: 'Robot Agricoli', icon: '🚜', description: 'Trattori autonomi, droni', color: 'bg-green-50', stats: 'In crescita' },
        { title: 'Robot di Servizio', icon: '🤖', description: 'Assistenza, logistica, sanità', color: 'bg-purple-50', stats: 'Sperimentale' },
        { title: 'Umanoidi', icon: '👤', description: 'Tesla Optimus e simili', color: 'bg-amber-50', stats: 'Frontier' }
      ],
      autonomousBusiness: [
        { label: 'Operazioni autonome', value: 40, color: '#3B82F6' },
        { label: 'Decisioni AI-driven', value: 60, color: '#10B981' },
        { label: 'Machine customers', value: 25, color: '#8B5CF6' }
      ]
    },
    videos: [
      { title: 'Tesla Optimus Robot Demo', source: 'Tesla', duration: '5:00', url: 'https://www.youtube.com/results?search_query=tesla+optimus+robot', thumbnailColor: 'gray', language: 'EN' }
    ],
    articles: [
      { title: 'The Rise of Autonomous Business', source: 'Gartner', type: 'Report', year: '2025', url: 'https://www.gartner.com/en/articles/hype-cycle-for-emerging-technologies' }
    ],
    links: [
      { title: 'Naïo Technologies', source: 'naio-technologies.com', url: 'https://www.naio-technologies.com/', icon: '🌱' },
      { title: 'Boston Dynamics', source: 'bostondynamics.com', url: 'https://www.bostondynamics.com/', icon: '🤖' }
    ],
    hasQuiz: true,
    quiz: {
      question: 'Quale vantaggio chiave offre la robotica agricola?',
      options: [
        'Solo riduzione dei costi',
        'Maggiore sicurezza sul lavoro e operatività 24/7',
        'Eliminazione completa della manodopera',
        'Produzione di robot per altri settori'
      ],
      correctIndex: 1,
      explanation: 'La robotica agricola permette di svolgere attività rischiose (irrorazione, movimentazione) in sicurezza e di operare anche di notte o in condizioni meteo avverse.'
    }
  },

  // SLIDE 7: Quantum Computing
  {
    id: 7,
    section: 'Quantum',
    title: 'Quantum Computing',
    content: {
      status: {
        maturity: 'Frontier Innovation',
        adoption: 'Sperimentale',
        timeline: '2026-2030 per Quantum Advantage'
      },
      players: [
        { name: 'IBM', qubits: '1000+', status: 'Leader' },
        { name: 'Google', qubits: '70+ (Sycamore)', status: 'R&D' },
        { name: 'Pasqal (EU)', qubits: '100+', status: 'Startup' },
        { name: 'Nvidia', qubits: 'Acceleratori', status: 'Hybrid' }
      ],
      applications: [
        { title: 'Ottimizzazione', icon: '📊', description: 'Logistica, finanza, supply chain' },
        { title: 'Crittografia', icon: '🔐', description: 'Post-quantum security' },
        { title: 'Drug Discovery', icon: '💊', description: 'Simulazione molecolare' },
        { title: 'Materiali', icon: '🔬', description: 'Nuovi materiali e batterie' }
      ]
    },
    videos: [
      { title: 'Quantum Computing Explained', source: 'IBM', duration: '10:00', url: 'https://www.youtube.com/results?search_query=quantum+computing+explained+ibm', thumbnailColor: 'blue', language: 'EN' }
    ],
    articles: [
      { title: 'Quantum Flagship EU', source: 'Commissione UE', type: 'Guida', year: '2024', url: 'https://qt.eu/' }
    ],
    links: [
      { title: 'IBM Quantum', source: 'ibm.com', url: 'https://www.ibm.com/quantum', icon: '⚛️' },
      { title: 'EU Quantum Flagship', source: 'qt.eu', url: 'https://qt.eu/', icon: '🇪🇺' }
    ]
  },

  // SLIDE 8: Agrifood Tech
  {
    id: 8,
    section: 'Agrifood',
    title: 'Tecnologie per il Settore Agroalimentare',
    content: {
      digitalAdoption: [
        { label: 'Agricoltori con software', value: 93, color: '#10B981' },
        { label: 'Tech digitali per colture', value: 79, color: '#3B82F6' },
        { label: 'Strumenti digitali allevamento', value: 83, color: '#8B5CF6' },
        { label: 'Automazione avanzata', value: 25, color: '#F59E0B' }
      ],
      precisionAg: [
        { title: 'Sensori IoT', icon: '📡', description: 'Umidità suolo, meteo, nutrienti', benefit: '-20-30% input' },
        { title: 'Droni multispettrali', icon: '🚁', description: 'Mappe vigore, stress, malattie', benefit: 'Interventi mirati' },
        { title: 'AI Decision Support', icon: '🧠', description: 'Previsione rese, timing interventi', benefit: '+15% efficienza' },
        { title: 'Irrigazione smart', icon: '💧', description: 'Controllo automatico basato su dati', benefit: '-30-40% acqua' }
      ]
    },
    videos: [
      { title: 'Agricoltura e IA: il digitale avanza', source: 'La Repubblica', duration: '8:00', url: 'https://www.repubblica.it/dossier/economia/top-story/2025/11/26/news/agricoltura_e_ia_il_digitale_avanza-425005288/', thumbnailColor: 'green', language: 'IT' }
    ],
    articles: [
      { title: 'Digitalizzazione Agricoltura UE', source: 'Commissione Europea', type: 'Report', year: '2024', url: 'https://agriculture.ec.europa.eu/overview-vision-agriculture-food/digitalisation_it', description: 'Studio JRC sulla digitalizzazione agricola europea' },
      { title: 'Agricoltura e IA, il digitale avanza', source: 'La Repubblica', type: 'Articolo', year: '2025', url: 'https://www.repubblica.it/dossier/economia/top-story/2025/11/26/news/agricoltura_e_ia_il_digitale_avanza-425005288/' }
    ],
    links: [
      { title: 'Digitalizzazione Agricoltura UE', source: 'europa.eu', url: 'https://agriculture.ec.europa.eu/overview-vision-agriculture-food/digitalisation_it', icon: '🌾' },
      { title: 'Farm to Fork Strategy', source: 'europa.eu', url: 'https://food.ec.europa.eu/horizontal-topics/farm-fork-strategy_en', icon: '🍴' }
    ]
  },

  // SLIDE 9: Vitivinicolo Overview
  {
    id: 9,
    section: 'Vino',
    title: 'Trend Tecnologici nel Settore Vitivinicolo',
    content: {
      marketData: [
        { icon: '👥', value: 3, suffix: ' Mln', label: 'Posti di lavoro UE' },
        { icon: '💰', value: 130, suffix: ' Mld€', label: 'Contributo PIL UE' },
        { icon: '🍇', value: 1.3, suffix: ' Mld€', label: 'Perdite per frodi/anno' },
        { icon: '🌱', value: 20, suffix: '%', label: 'Superficie bio Italia' }
      ],
      techAreas: [
        { title: 'Viticoltura 4.0', icon: '🍇', description: 'Precision viticulture, droni, sensori', color: 'bg-green-50' },
        { title: 'Cantina Smart', icon: '🏭', description: 'Automazione, fermentatori IoT, ERP', color: 'bg-blue-50' },
        { title: 'Tracciabilità', icon: '⛓️', description: 'Blockchain, QR code, NFC', color: 'bg-purple-50' },
        { title: 'Marketing Digitale', icon: '🎭', description: 'AR, VR, Metaverso, NFT', color: 'bg-pink-50' }
      ]
    },
    videos: [
      { title: 'I 5 Top Trend 2025 nell industria del vino', source: 'TeamSystem', duration: '6:00', url: 'https://www.teamsystem.com/magazine/settore-agroalimentare/nuovi-trend-tecnologia-industria-vino/', thumbnailColor: 'purple', language: 'IT' }
    ],
    articles: [
      { title: 'I 5 top trend del 2025 nel vino', source: 'TeamSystem', type: 'Articolo', year: '2025', url: 'https://www.teamsystem.com/magazine/settore-agroalimentare/nuovi-trend-tecnologia-industria-vino/' }
    ],
    links: [
      { title: 'TeamSystem Wine Trends', source: 'teamsystem.com', url: 'https://www.teamsystem.com/magazine/settore-agroalimentare/nuovi-trend-tecnologia-industria-vino/', icon: '🍷' },
      { title: 'Unione Italiana Vini', source: 'unioneitalianavini.it', url: 'https://www.unioneitalianavini.it/', icon: '🇮🇹' }
    ]
  },

  // SLIDE 10: Viticoltura di Precisione
  {
    id: 10,
    section: 'Vino',
    title: 'Viticoltura di Precisione e Automazione',
    content: {
      precisionTools: [
        { title: 'Sensori IoT vigneto', icon: '📡', description: 'Temperatura, umidità, bagnatura fogliare', benefit: 'Allerta malattie' },
        { title: 'Droni multispettrali', icon: '🚁', description: 'Mappe NDVI, stress idrico', benefit: 'Trattamenti mirati' },
        { title: 'DSS viticoli', icon: '🧠', description: 'Modelli peronospora, oidio', benefit: '-30% trattamenti' },
        { title: 'Vendemmia predittiva', icon: '📊', description: 'AI per timing raccolta ottimale', benefit: 'Qualità superiore' }
      ],
      robotInnovation: {
        name: 'Black Shire RC 3075',
        description: 'Robot cingolato porta-attrezzi autonomo premiato a Enovitis 2025',
        features: ['Motore ibrido 75 CV', 'Lavora 24/7', 'Lidar + videocamere', 'Rileva ostacoli e persone']
      }
    },
    videos: [
      { title: 'Enovitis in Campo 2025: le innovazioni premiate', source: 'AgroNotizie', duration: '10:00', url: 'https://agronotizie.imagelinenetwork.com/agrimeccanica/2025/06/13/enovitis-in-campo-2025-luci-puntate-su-7-innovazioniper-la-viticoltura/87531', thumbnailColor: 'green', language: 'IT' }
    ],
    articles: [
      { title: 'Enovitis 2025: le 7 innovazioni premiate', source: 'AgroNotizie', type: 'Articolo', year: '2025', url: 'https://agronotizie.imagelinenetwork.com/agrimeccanica/2025/06/13/enovitis-in-campo-2025-luci-puntate-su-7-innovazioniper-la-viticoltura/87531', description: 'Robot, trattori autonomi e soluzioni per il vigneto' }
    ],
    links: [
      { title: 'Enovitis in Campo', source: 'agronotizie.it', url: 'https://agronotizie.imagelinenetwork.com/agrimeccanica/2025/06/13/enovitis-in-campo-2025-luci-puntate-su-7-innovazioniper-la-viticoltura/87531', icon: '🍇' },
      { title: 'Black Shire Robotics', source: 'blackshire.it', url: 'https://www.blackshire.it/', icon: '🤖' }
    ],
    hasQuiz: true,
    quiz: {
      question: 'Qual è il principale vantaggio della viticoltura di precisione?',
      options: [
        'Aumentare la produzione del 50%',
        'Eliminare completamente i trattamenti',
        'Ridurre input (acqua, fitofarmaci) mantenendo o migliorando la qualità',
        'Sostituire tutti i lavoratori con robot'
      ],
      correctIndex: 2,
      explanation: 'La viticoltura di precisione permette interventi mirati solo dove serve, riducendo del 20-30% l\'uso di acqua e agrochimici mantenendo o migliorando la qualità delle uve.'
    }
  },

  // SLIDE 11: Tracciabilità e Smart Labeling
  {
    id: 11,
    section: 'Vino',
    title: 'Tracciabilità e Smart Wine Labels',
    content: {
      projects: [
        { title: 'TraceWINDU', description: 'Progetto UE: blockchain + impronta chimica del vino', icon: '🇪🇺', features: ['QR code su etichetta', 'Analisi isotopiche', 'Passaporto digitale vino'] },
        { title: 'Wineability', description: 'Piattaforma italiana RFID + blockchain', icon: '🇮🇹', features: ['ID digitale per bottiglia', 'Tag NFC su capsula', 'Wallet digitale collezionisti'] }
      ],
      benefits: [
        { label: 'Anti-contraffazione', icon: '🛡️', description: 'Verifica autenticità immediata' },
        { label: 'Storytelling', icon: '📖', description: 'Video, territorio, famiglia produttrice' },
        { label: 'Compliance', icon: '📋', description: 'Reg. UE etichettatura 2023' },
        { label: 'Engagement', icon: '💬', description: 'Canale diretto bottiglia-consumatore' }
      ]
    },
    videos: [
      { title: 'TraceWINDU: blockchain per il vino europeo', source: 'WineNews', duration: '5:00', url: 'https://winenews.it/it/contro-le-contraffazioni-del-vino-lunione-europa-schiera-chimica-e-tecnologia-blockchain_557087/', thumbnailColor: 'purple', language: 'IT' }
    ],
    articles: [
      { title: 'TraceWINDU: chimica e blockchain contro le frodi', source: 'WineNews', type: 'Articolo', year: '2024', url: 'https://winenews.it/it/contro-le-contraffazioni-del-vino-lunione-europa-schiera-chimica-e-tecnologia-blockchain_557087/' },
      { title: 'Wineability: transizione digitale per il vino', source: 'Wine Meridian', type: 'Case Study', year: '2024', url: 'https://www.winemeridian.com/approfondimenti/smart-wine-wineability-guida-la-transizione-digitale-per-il-vino/' }
    ],
    links: [
      { title: 'Wineability', source: 'wineability.it', url: 'https://www.winemeridian.com/approfondimenti/smart-wine-wineability-guida-la-transizione-digitale-per-il-vino/', icon: '🍷' },
      { title: 'WineNews TraceWINDU', source: 'winenews.it', url: 'https://winenews.it/it/contro-le-contraffazioni-del-vino-lunione-europa-schiera-chimica-e-tecnologia-blockchain_557087/', icon: '📰' }
    ]
  },

  // SLIDE 12: Marketing Immersivo e Metaverso
  {
    id: 12,
    section: 'Vino',
    title: 'Marketing Immersivo e Metaverso del Vino',
    content: {
      experiences: [
        { title: 'Cantina Cotarella Digitale', description: 'Prima cantina italiana nel metaverso (2023)', icon: '🏛️', tech: 'VR + Digital Twin + AI' },
        { title: 'TellyWine', description: 'App AI che riconosce etichette vino italiano', icon: '📱', tech: 'AI + AR + Community' },
        { title: 'Etichette AR', description: 'Cantina Orsogna Vola Volé - etichette animate', icon: '🎭', tech: 'Realtà Aumentata' },
        { title: 'Crurated NFT', description: 'Cantina virtuale con NFT per collezionisti', icon: '🪙', tech: 'Blockchain + NFT' }
      ],
      platforms: [
        { name: 'Vinophila', description: 'Prima fiera digitale permanente 3D del vino', url: 'https://innovationhero.it/2023/02/20/lorenzo-biscontin-vinophila-metaverso/' }
      ]
    },
    videos: [
      { title: 'Famiglia Cotarella nel Metaverso', source: 'WineNews', duration: '4:00', url: 'https://winenews.it/it/il-vino-nel-metaverso-con-la-cantina-digitale-di-famiglia-cotarella_494358/', thumbnailColor: 'purple', language: 'IT' }
    ],
    articles: [
      { title: 'Il vino nel Metaverso: cantina digitale Cotarella', source: 'WineNews', type: 'Case Study', year: '2023', url: 'https://winenews.it/it/il-vino-nel-metaverso-con-la-cantina-digitale-di-famiglia-cotarella_494358/' },
      { title: 'TellyWine: IA per i vini italiani', source: 'Wine Couture', type: 'Articolo', year: '2025', url: 'https://winecouture.it/2025/02/17/tellywine-la-prima-app-che-usa-lintelligenza-artificiale-per-promuovere-i-vini-italiani-nelmondo/' },
      { title: 'Crurated: vino nel metaverso', source: 'Italia a Tavola', type: 'Articolo', year: '2024', url: 'https://www.italiaatavola.net/wine/2024/2/13/crurated-vino-metaverso-collezionismo/103057/' }
    ],
    links: [
      { title: 'TellyWine App', source: 'tellywine.com', url: 'https://tellywine.com/it', icon: '📱' },
      { title: 'Vinophila Metaverso', source: 'vinophila.com', url: 'https://innovationhero.it/2023/02/20/lorenzo-biscontin-vinophila-metaverso/', icon: '🌐' },
      { title: 'Cantina Orsogna AR', source: 'biocantinaorsogna.it', url: 'https://www.biocantinaorsogna.it/le-etichette-con-la-realta-aumentata/', icon: '🎭' }
    ],
    videoSuggestion: { icon: '🎯', title: 'Da non perdere', text: 'Il caso Cotarella mostra come VR, Digital Twin e AI possano creare un customer journey completamente nuovo nel mondo del vino.', color: 'purple' }
  }
];

// ============================================
// COMPONENTE PRINCIPALE
// ============================================

export default function ModuloTrendTecnologici({ onBack }: { onBack?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('contenuto');

  const slide = slidesData[currentSlide];
  const progress = ((currentSlide + 1) / slidesData.length) * 100;

  const tabs = [
    { id: 'contenuto', label: 'Contenuto', icon: '📚' },
    { id: 'video', label: 'Video', icon: '🎥', count: slide.videos?.length || 0 },
    { id: 'articoli', label: 'Articoli & PDF', icon: '📄', count: slide.articles?.length || 0 },
    { id: 'link', label: 'Link Esterni', icon: '🔗', count: slide.links?.length || 0 }
  ];

  // Reset tab quando cambia slide
  useEffect(() => {
    setActiveTab('contenuto');
  }, [currentSlide]);

  const renderSlideContent = () => {
    const content = slide.content;

    switch (slide.id) {
      case 1: // Intro
        return (
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              Dal 2026 in poi, diverse tecnologie emergenti ridefiniscono settori industriali e società. 
              L&apos;intelligenza artificiale avanzata funge da amplificatore per molte innovazioni, 
              mentre IoT, blockchain e quantum computing abilitano nuovi ecosistemi digitali.
            </p>
            
            <StatsGrid stats={content.mainStats} />
            
            <div className="mt-6">
              <h4 className="font-bold text-gray-800 mb-4">🎯 Tech Radar: Tecnologie Chiave</h4>
              <TechRadar technologies={content.keyTrends} />
            </div>
          </div>
        );

      case 2: // AI Avanzata
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              L&apos;AI continua a progredire rapidamente, passando da sistemi specializzati a modelli generativi 
              e agenti sempre più autonomi. Circa l&apos;80% delle aziende ha già adottato soluzioni AI.
            </p>
            
            <StatsGrid stats={content.mainStats} />
            
            <div className="mt-6">
              <h4 className="font-bold text-gray-800 mb-4">📈 Evoluzione dell&apos;AI</h4>
              <div className="space-y-3">
                {content.aiEvolution.map((item: { year: string; title: string; description: string; icon: string }, idx: number) => (
                  <TimelineItem key={idx} {...item} isActive={idx === 1} />
                ))}
              </div>
            </div>

            {slide.hasQuiz && slide.quiz && (
              <MiniQuiz {...slide.quiz} />
            )}
          </div>
        );

      case 3: // IoT e Digital Twin
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              L&apos;IoT di nuova generazione vedrà miliardi di dispositivi connessi. 
              I gemelli digitali (digital twin) consentono di simulare e ottimizzare operazioni 
              nel mondo virtuale prima di applicarle nel reale.
            </p>
            
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl p-6 text-white">
              <h4 className="font-bold mb-4">💰 Crescita Mercato Digital Twin</h4>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold">~16 Mld€</div>
                  <div className="text-sm opacity-80">2025</div>
                </div>
                <div className="text-4xl">→</div>
                <div className="text-center">
                  <div className="text-3xl font-bold">240+ Mld€</div>
                  <div className="text-sm opacity-80">2032</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {content.useCases.map((useCase: { title: string; icon: string; description: string; color: string }, idx: number) => (
                <TechCard key={idx} {...useCase} />
              ))}
            </div>
          </div>
        );

      case 4: // Blockchain
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              La blockchain sta evolvendo verso applicazioni più mature: tracciabilità alimentare, 
              valute digitali (Euro digitale), tokenizzazione di asset e identità digitale.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {content.applications.map((app: { title: string; icon: string; description: string; color: string; stats: string }, idx: number) => (
                <TechCard key={idx} {...app} />
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-bold text-gray-800 mb-4">📊 Vantaggi della Blockchain</h4>
              {content.benefits.map((b: { label: string; value: number }, idx: number) => (
                <ProgressBar key={idx} label={b.label} value={b.value} color="#10B981" delay={idx * 200} />
              ))}
            </div>
          </div>
        );

      case 5: // AR/VR
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Le tecnologie immersive stanno guadagnando interesse per rivoluzionare interfacce e modalità di interazione.
              L&apos;adozione enterprise è ancora in fase sperimentale (livello 2 su 5).
            </p>
            
            <div className="bg-purple-50 rounded-xl p-5">
              <h4 className="font-bold text-gray-800 mb-3">📊 Livello di Adozione Enterprise</h4>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={`flex-1 h-4 rounded ${level <= content.maturityLevel.current ? 'bg-purple-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-2">{content.maturityLevel.label}: {content.maturityLevel.current}/{content.maturityLevel.max}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {content.applications.map((app: { title: string; icon: string; description: string; color: string }, idx: number) => (
                <TechCard key={idx} {...app} />
              ))}
            </div>
          </div>
        );

      case 6: // Robotica
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              L&apos;automazione avanzata attraverso robotica sta passando dalla fabbrica a molti altri contesti: 
              agricoltura, logistica, sanità, servizi.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {content.robotTypes.map((robot: { title: string; icon: string; description: string; color: string; stats: string }, idx: number) => (
                <TechCard key={idx} {...robot} />
              ))}
            </div>

            {slide.hasQuiz && slide.quiz && (
              <MiniQuiz {...slide.quiz} />
            )}
          </div>
        );

      case 7: // Quantum
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Il quantum computing è ancora in fase embrionale ma dal potenziale dirompente. 
              Le applicazioni commerciali sono sperimentali, ma si prevede il &quot;Quantum Advantage&quot; 
              per problemi specifici entro il 2026-2030.
            </p>
            
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">⚛️</span>
                <div>
                  <div className="font-bold">Status: {content.status.maturity}</div>
                  <div className="text-sm opacity-80">Timeline: {content.status.timeline}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {content.applications.map((app: { title: string; icon: string; description: string }, idx: number) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl mb-2">{app.icon}</div>
                  <div className="font-semibold text-gray-800">{app.title}</div>
                  <div className="text-sm text-gray-600">{app.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 8: // Agrifood
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              L&apos;innovazione tecnologica sta permeando la filiera agroalimentare europea. 
              Il 93% degli agricoltori utilizza almeno un software, il 79% ha adottato tecnologie digitali 
              specifiche per le colture.
            </p>
            
            <div className="bg-green-50 rounded-xl p-5">
              <h4 className="font-bold text-gray-800 mb-4">📊 Adozione Digitale in Agricoltura UE</h4>
              {content.digitalAdoption.map((item: { label: string; value: number; color: string }, idx: number) => (
                <ProgressBar key={idx} label={item.label} value={item.value} color={item.color} delay={idx * 200} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {content.precisionAg.map((tool: { title: string; icon: string; description: string; benefit: string }, idx: number) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-2xl mb-2">{tool.icon}</div>
                  <div className="font-semibold text-gray-800">{tool.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{tool.description}</div>
                  <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded inline-block">{tool.benefit}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 9: // Vino Overview
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Il settore vitivinicolo sta vivendo una piccola rivoluzione digitale. 
              Tradizione e innovazione si incontrano in vigna e in cantina.
            </p>
            
            <StatsGrid stats={content.marketData} />

            <div className="grid grid-cols-2 gap-4">
              {content.techAreas.map((area: { title: string; icon: string; description: string; color: string }, idx: number) => (
                <TechCard key={idx} {...area} />
              ))}
            </div>
          </div>
        );

      case 10: // Viticoltura Precisione
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              La viticoltura di precisione applica sensori, dati e AI per gestire le viti pianta per pianta, 
              anziché con interventi uniformi sull&apos;intero appezzamento.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {content.precisionTools.map((tool: { title: string; icon: string; description: string; benefit: string }, idx: number) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-2xl mb-2">{tool.icon}</div>
                  <div className="font-semibold text-gray-800">{tool.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{tool.description}</div>
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">{tool.benefit}</div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <div className="font-bold">{content.robotInnovation.name}</div>
                  <div className="text-sm opacity-80">{content.robotInnovation.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.robotInnovation.features.map((f: string, idx: number) => (
                  <span key={idx} className="bg-white/20 px-2 py-1 rounded text-xs">{f}</span>
                ))}
              </div>
            </div>

            {slide.hasQuiz && slide.quiz && (
              <MiniQuiz {...slide.quiz} />
            )}
          </div>
        );

      case 11: // Tracciabilità
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              La tracciabilità e trasparenza della filiera sono critiche nel mondo del vino, 
              sia per garantire qualità al consumatore sia per tutelare i produttori dalla contraffazione.
            </p>
            
            {content.projects.map((project: { title: string; description: string; icon: string; features: string[] }, idx: number) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{project.icon}</span>
                  <div>
                    <div className="font-bold text-gray-800">{project.title}</div>
                    <div className="text-sm text-gray-600">{project.description}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.features.map((f: string, fidx: number) => (
                    <span key={fidx} className="bg-white px-3 py-1 rounded-full text-sm border">{f}</span>
                  ))}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              {content.benefits.map((b: { label: string; icon: string; description: string }, idx: number) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-2xl mb-2">{b.icon}</div>
                  <div className="font-semibold text-gray-800">{b.label}</div>
                  <div className="text-sm text-gray-600">{b.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 12: // Metaverso Vino
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Il settore del vino sta esplorando nuove frontiere di interazione col pubblico 
              grazie alle tecnologie digitali immersive: VR, AR, NFT e metaverso.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {content.experiences.map((exp: { title: string; description: string; icon: string; tech: string }, idx: number) => (
                <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="text-2xl mb-2">{exp.icon}</div>
                  <div className="font-bold text-gray-800">{exp.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{exp.description}</div>
                  <div className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">{exp.tech}</div>
                </div>
              ))}
            </div>

            {slide.videoSuggestion && (
              <SuggestionBox {...slide.videoSuggestion} />
            )}
          </div>
        );

      default:
        return <div>Contenuto non disponibile</div>;
    }
  };

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
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <div className="font-semibold text-gray-800">Trend Tecnologici 2026+</div>
                  <div className="text-sm text-gray-500">{slide.section}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Slide {currentSlide + 1} di {slidesData.length}
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-sm text-indigo-600 font-medium mb-2">{slide.section}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{slide.title}</h2>

          {activeTab === 'contenuto' && renderSlideContent()}

          {activeTab === 'video' && (
            <div className="space-y-4">
              {slide.videoSuggestion && (
                <SuggestionBox {...slide.videoSuggestion} />
              )}
              <div className="grid grid-cols-2 gap-4">
                {slide.videos?.map((video, idx) => (
                  <VideoCard key={idx} {...video} />
                ))}
              </div>
              {(!slide.videos || slide.videos.length === 0) && (
                <p className="text-gray-500 text-center py-8">Nessun video disponibile per questa slide</p>
              )}
            </div>
          )}

          {activeTab === 'articoli' && (
            <div className="space-y-3">
              {slide.articleSuggestion && (
                <SuggestionBox {...slide.articleSuggestion} />
              )}
              {slide.articles?.map((article, idx) => (
                <ArticleCard key={idx} {...article} />
              ))}
              {(!slide.articles || slide.articles.length === 0) && (
                <p className="text-gray-500 text-center py-8">Nessun articolo disponibile per questa slide</p>
              )}
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {slide.links?.map((link, idx) => (
                  <ExternalLinkCard key={idx} {...link} />
                ))}
              </div>
              {(!slide.links || slide.links.length === 0) && (
                <p className="text-gray-500 text-center py-8">Nessun link disponibile per questa slide</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Indietro
          </button>

          <div className="flex gap-2">
            {slidesData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-indigo-500 w-6'
                    : idx < currentSlide
                    ? 'bg-indigo-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(slidesData.length - 1, currentSlide + 1))}
            disabled={currentSlide === slidesData.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === slidesData.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            Avanti →
          </button>
        </div>

        {/* Slide Overview */}
        <div className="mt-8 bg-white rounded-xl p-4">
          <h4 className="font-semibold text-gray-700 mb-3">📖 Panoramica Modulo</h4>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {slidesData.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`p-2 rounded-lg text-xs text-center transition-all ${
                  idx === currentSlide
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                    : idx < currentSlide
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="font-bold">{idx + 1}</div>
                <div className="truncate">{s.section}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
