import { ModuleJSON } from '@/types/module';

export const hackathonWinetechModule: ModuleJSON = {
  "id": "hackathon-winetech-2024",
  "titolo": "WineTech Demo Day",
  "descrizione": "Hackathon finale: trasforma la tua idea in un pitch multimediale innovativo",
  "durata": "5 ore",
  "icon": "🏆",
  "tipo": "hackathon",
  "config": {
    "startTime": "2024-12-05T09:00:00",
    "endTime": "2024-12-05T14:00:00",
    "totalMinutes": 300,
    "phases": [
      { "name": "Kick-off & Brief", "duration": 15, "color": "#8B5CF6" },
      { "name": "Pitch Wizard", "duration": 45, "color": "#3B82F6" },
      { "name": "Creazione Contenuti", "duration": 150, "color": "#10B981" },
      { "name": "Finalizzazione", "duration": 30, "color": "#F59E0B" },
      { "name": "Presentazioni", "duration": 45, "color": "#EF4444" },
      { "name": "Voting & Premi", "duration": 15, "color": "#EC4899" }
    ]
  },
  "slides": [
    {
      "id": 1,
      "section": "Kick-off",
      "title": "WineTech Demo Day",
      "type": "hero",
      "visualContent": {
        "heroBanner": {
          "emoji": "🏆🍷",
          "title": "WineTech Demo Day",
          "description": "5 ore per trasformare la vostra idea in un pitch che lascia il segno"
        },
        "countdown": {
          "enabled": true,
          "label": "Tempo rimanente",
          "showPhase": true
        },
        "mainStats": [
          { "value": 8, "suffix": "", "label": "Squadre in gara", "icon": "👥" },
          { "value": 5, "suffix": "h", "label": "Di lavoro intenso", "icon": "⏱️" },
          { "value": 5, "suffix": "", "label": "Formati pitch possibili", "icon": "🎬" },
          { "value": 1000, "suffix": "pt", "label": "In palio per i vincitori", "icon": "🏆" }
        ],
        "themes": [
          { "icon": "🎬", "label": "Video Pitch" },
          { "icon": "🎙️", "label": "Podcast" },
          { "icon": "🌐", "label": "Landing Page" },
          { "icon": "📱", "label": "Prototipo" },
          { "icon": "🎭", "label": "Live Demo" }
        ],
        "alertBox": {
          "type": "success",
          "icon": "🎯",
          "title": "La sfida di oggi",
          "text": "Ogni squadra ha già la propria idea. Oggi dovete renderla <strong>irresistibile</strong>: scegliete il formato giusto e create un pitch che conquisti giuria e colleghi!"
        }
      },
      "videos": [],
      "articles": [],
      "links": []
    },
    {
      "id": 2,
      "section": "Brief",
      "title": "Regole del Gioco",
      "type": "rules",
      "visualContent": {
        "introParagraph": "Non è un pitch tradizionale con PowerPoint. Siete liberi di scegliere il formato che meglio racconta la vostra idea.",
        "pitchFormats": [
          {
            "id": "video",
            "icon": "🎬",
            "name": "Video Pitch",
            "duration": "2-3 minuti",
            "description": "Storytelling visivo, demo del prodotto, testimonial finti, spot pubblicitario",
            "tools": ["CapCut", "Canva Video", "iPhone/Android", "HeyGen AI"],
            "bestFor": "Prodotti visivi, app, esperienze utente",
            "difficulty": "Media",
            "examples": ["Demo prodotto", "Video storytelling", "Fake commercial", "Tutorial"]
          },
          {
            "id": "podcast",
            "icon": "🎙️",
            "name": "Podcast Episode",
            "duration": "5-7 minuti",
            "description": "Intervista al founder, discussione problema/soluzione, formato talk show",
            "tools": ["Spotify for Podcasters", "Audacity", "NotebookLM", "ElevenLabs"],
            "bestFor": "Idee complesse che richiedono spiegazione, B2B",
            "difficulty": "Facile",
            "examples": ["Intervista founder", "Dibattito problema", "Mini-documentario audio"]
          },
          {
            "id": "landing",
            "icon": "🌐",
            "name": "Landing Page",
            "duration": "1 pagina web",
            "description": "Sito web del prodotto con value proposition, features, CTA",
            "tools": ["Framer", "Carrd", "Canva Sites", "v0.dev"],
            "bestFor": "Prodotti digitali, SaaS, piattaforme",
            "difficulty": "Media",
            "examples": ["Product page", "Coming soon", "Waitlist page"]
          },
          {
            "id": "prototype",
            "icon": "📱",
            "name": "Prototipo Interattivo",
            "duration": "5-10 schermate",
            "description": "Mockup cliccabile dell'app/piattaforma, user flow completo",
            "tools": ["Figma", "Canva", "Marvel App", "Uizard AI"],
            "bestFor": "App mobile, dashboard, interfacce utente",
            "difficulty": "Alta",
            "examples": ["App prototype", "Dashboard demo", "AR experience mockup"]
          },
          {
            "id": "live",
            "icon": "🎭",
            "name": "Live Pitch + Demo",
            "duration": "5 minuti",
            "description": "Presentazione dal vivo con dimostrazione pratica, roleplay, teatralità",
            "tools": ["Voi stessi!", "Props fisici", "Demo reale"],
            "bestFor": "Hardware, esperienze fisiche, enoturismo",
            "difficulty": "Alta",
            "examples": ["Demo dal vivo", "Roleplay cliente", "Unboxing experience"]
          }
        ],
        "scoringCriteria": [
          { "name": "Innovazione", "weight": 25, "description": "Quanto è originale e innovativa l'idea?", "icon": "💡" },
          { "name": "Fattibilità", "weight": 20, "description": "È realizzabile concretamente?", "icon": "🔧" },
          { "name": "Impatto", "weight": 20, "description": "Che valore genera per il settore vitivinicolo?", "icon": "🎯" },
          { "name": "Qualità Pitch", "weight": 20, "description": "Quanto è efficace la comunicazione?", "icon": "🎬" },
          { "name": "Uso Tecnologie", "weight": 15, "description": "Come integra le tecnologie del corso?", "icon": "🤖" }
        ],
        "bonusPoints": [
          { "name": "Scelta coraggiosa formato", "points": 50, "description": "Video/Podcast/Prototipo invece di slide" },
          { "name": "Uso AI generativa", "points": 30, "description": "HeyGen, ElevenLabs, Midjourney, etc." },
          { "name": "Demo funzionante", "points": 50, "description": "Qualcosa che funziona davvero" },
          { "name": "Wow factor", "points": 100, "description": "Giuria a bocca aperta" }
        ],
        "alertBox": {
          "type": "warning",
          "icon": "⚠️",
          "title": "Attenzione",
          "text": "NO PowerPoint tradizionali! L'obiettivo è spingervi fuori dalla comfort zone e farvi usare i tool che avete imparato durante il corso."
        }
      },
      "videos": [],
      "articles": [],
      "links": []
    },
    {
      "id": 3,
      "section": "Wizard",
      "title": "Pitch Canvas Wizard",
      "type": "wizard",
      "visualContent": {
        "introParagraph": "Prima di creare il pitch, compilate insieme questo canvas. Vi guiderà a strutturare i contenuti chiave in modo chiaro e convincente.",
        "wizardSteps": [
          {
            "step": 1,
            "title": "Il Problema",
            "subtitle": "Qual è il pain point che risolvete?",
            "timeMinutes": 5,
            "prompts": [
              "Chi soffre di questo problema? (viticoltore, cantina, consumatore, enoteca...)",
              "Quanto è grave? (frequenza, costo, frustrazione)",
              "Come lo risolvono oggi? (workaround attuali)",
              "Perché le soluzioni attuali non bastano?"
            ],
            "example": {
              "team": "LabelAlive",
              "content": "I consumatori under 35 non capiscono le etichette del vino. Il 67% si sente intimidito e sceglie a caso. Le etichette tradizionali parlano agli esperti, non ai nuovi bevitori."
            },
            "output": "1-2 frasi che fanno dire 'Sì, è vero!'",
            "color": "#EF4444"
          },
          {
            "step": 2,
            "title": "La Soluzione",
            "subtitle": "Come lo risolvete?",
            "timeMinutes": 5,
            "prompts": [
              "In una frase: cosa fate?",
              "Come funziona? (3 step massimo)",
              "Qual è la 'magia' che rende possibile tutto questo?",
              "Cosa cambia nella vita dell'utente?"
            ],
            "example": {
              "team": "LabelAlive",
              "content": "Etichette AR che prendono vita. Inquadri col telefono, il produttore ti racconta il vino in 30 secondi. Zero gergo tecnico, 100% storytelling."
            },
            "output": "Elevator pitch in 30 secondi",
            "color": "#10B981"
          },
          {
            "step": 3,
            "title": "Il Target",
            "subtitle": "Per chi è?",
            "timeMinutes": 5,
            "prompts": [
              "Chi è il vostro cliente ideale? (persona specifica)",
              "Quanti sono? (dimensione mercato)",
              "Dove li trovate? (canali)",
              "Quanto spenderebbero? (willingness to pay)"
            ],
            "example": {
              "team": "LabelAlive",
              "content": "Millennials e Gen Z italiani (8M persone), consumatori occasionali di vino, budget 8-15€ a bottiglia. Li raggiungiamo in enoteca e GDO."
            },
            "output": "Persona + mercato potenziale",
            "color": "#3B82F6"
          },
          {
            "step": 4,
            "title": "Il Vantaggio Competitivo",
            "subtitle": "Perché voi e non altri?",
            "timeMinutes": 5,
            "prompts": [
              "Chi sono i competitor (diretti e indiretti)?",
              "Cosa fate meglio/diversamente?",
              "Qual è il vostro 'unfair advantage'?",
              "Perché è difficile copiarvi?"
            ],
            "example": {
              "team": "LabelAlive",
              "content": "19 Crimes ha aperto la strada ma è solo intrattenimento. Noi integriamo tracciabilità blockchain + storytelling + e-commerce. First mover in Italia sul segmento young."
            },
            "output": "Il vostro 'moat' difendibile",
            "color": "#8B5CF6"
          },
          {
            "step": 5,
            "title": "La Tecnologia",
            "subtitle": "Come lo costruite?",
            "timeMinutes": 5,
            "prompts": [
              "Quali tecnologie del corso usate? (AI, IoT, Blockchain, AR/VR)",
              "Come si integrano tra loro?",
              "Cosa esiste già vs cosa va sviluppato?",
              "Timeline realistica (MVP in quanto tempo?)"
            ],
            "example": {
              "team": "LabelAlive",
              "content": "AR con 8thWall (web-based, no app). Blockchain pOsti per tracciabilità. AI per generare script personalizzati da dati cantina. MVP in 3 mesi."
            },
            "output": "Stack tecnologico + roadmap",
            "color": "#F59E0B"
          },
          {
            "step": 6,
            "title": "Il Business Model",
            "subtitle": "Come fate soldi?",
            "timeMinutes": 5,
            "prompts": [
              "Chi paga? (cantina, consumatore, retailer...)",
              "Quanto? (pricing model)",
              "Ricavi ricorrenti o one-shot?",
              "Costi principali?"
            ],
            "example": {
              "team": "LabelAlive",
              "content": "B2B2C: le cantine pagano 0,15€/bottiglia per l'etichetta AR + 500€ setup. Break-even a 50.000 bottiglie/anno. Margine 60%."
            },
            "output": "Unit economics base",
            "color": "#EC4899"
          },
          {
            "step": 7,
            "title": "L'Ask",
            "subtitle": "Cosa chiedete?",
            "timeMinutes": 5,
            "prompts": [
              "Se la giuria fosse un investitore, cosa chiedereste?",
              "Se fosse un cliente, quale azione volete?",
              "Call to action chiara"
            ],
            "example": {
              "team": "LabelAlive",
              "content": "Cerchiamo 3 cantine pilota per testare in primavera 2025. Chi vuole essere tra i primi in Italia?"
            },
            "output": "CTA memorabile",
            "color": "#06B6D4"
          }
        ],
        "canvasTemplate": {
          "sections": [
            { "id": "problem", "label": "PROBLEMA", "color": "#EF4444", "position": "top-left" },
            { "id": "solution", "label": "SOLUZIONE", "color": "#10B981", "position": "top-right" },
            { "id": "target", "label": "TARGET", "color": "#3B82F6", "position": "middle-left" },
            { "id": "advantage", "label": "VANTAGGIO", "color": "#8B5CF6", "position": "middle-center" },
            { "id": "tech", "label": "TECNOLOGIA", "color": "#F59E0B", "position": "middle-right" },
            { "id": "business", "label": "BUSINESS MODEL", "color": "#EC4899", "position": "bottom-left" },
            { "id": "ask", "label": "ASK", "color": "#06B6D4", "position": "bottom-right" }
          ]
        },
        "downloadableTemplate": true,
        "timerPerStep": true
      },
      "videos": [],
      "articles": [],
      "links": [
        { "title": "Canva - Pitch Canvas Template", "source": "Template", "url": "https://www.canva.com/templates/?query=pitch-canvas", "icon": "🎨" },
        { "title": "Miro - Business Model Canvas", "source": "Template", "url": "https://miro.com/templates/business-model-canvas/", "icon": "📋" },
        { "title": "FigJam - Brainstorming", "source": "Tool", "url": "https://www.figma.com/figjam/", "icon": "💡" }
      ]
    },
    {
      "id": 4,
      "section": "Tools",
      "title": "Tool per Formato",
      "type": "resources",
      "visualContent": {
        "introParagraph": "Ecco i tool consigliati per ogni formato. Tutti hanno versione gratuita o trial. Scegliete quello più adatto al vostro pitch!",
        "toolCategories": [
          {
            "category": "🎬 Video Creation",
            "tools": [
              { "name": "CapCut", "url": "https://www.capcut.com/", "description": "Editor video gratuito, perfetto per mobile", "difficulty": "Facile", "free": true },
              { "name": "Canva Video", "url": "https://www.canva.com/video-editor/", "description": "Template pronti, drag & drop", "difficulty": "Facile", "free": true },
              { "name": "HeyGen", "url": "https://www.heygen.com/", "description": "Avatar AI che parlano - WOW factor!", "difficulty": "Media", "free": "Trial" },
              { "name": "Synthesia", "url": "https://www.synthesia.io/", "description": "Video con presentatore AI", "difficulty": "Media", "free": "Trial" },
              { "name": "Loom", "url": "https://www.loom.com/", "description": "Screen recording + webcam", "difficulty": "Facile", "free": true }
            ]
          },
          {
            "category": "🎙️ Podcast & Audio",
            "tools": [
              { "name": "NotebookLM", "url": "https://notebooklm.google.com/", "description": "Genera podcast automatici da documenti!", "difficulty": "Facile", "free": true },
              { "name": "ElevenLabs", "url": "https://elevenlabs.io/", "description": "Voci AI realistiche in italiano", "difficulty": "Media", "free": "Trial" },
              { "name": "Spotify for Podcasters", "url": "https://podcasters.spotify.com/", "description": "Registra e edita podcast", "difficulty": "Facile", "free": true },
              { "name": "Audacity", "url": "https://www.audacityteam.org/", "description": "Editor audio professionale gratuito", "difficulty": "Media", "free": true },
              { "name": "Descript", "url": "https://www.descript.com/", "description": "Edita audio come un documento Word", "difficulty": "Media", "free": "Trial" }
            ]
          },
          {
            "category": "🌐 Landing Page",
            "tools": [
              { "name": "Carrd", "url": "https://carrd.co/", "description": "Landing page in 10 minuti", "difficulty": "Facile", "free": true },
              { "name": "Framer", "url": "https://www.framer.com/", "description": "Siti web con AI, design pro", "difficulty": "Media", "free": true },
              { "name": "Canva Sites", "url": "https://www.canva.com/websites/", "description": "Drag & drop, template pronti", "difficulty": "Facile", "free": true },
              { "name": "v0.dev", "url": "https://v0.dev/", "description": "Genera UI con AI (di Vercel)", "difficulty": "Alta", "free": true },
              { "name": "Webflow", "url": "https://webflow.com/", "description": "Design avanzato no-code", "difficulty": "Alta", "free": "Trial" }
            ]
          },
          {
            "category": "📱 Prototipo & UI",
            "tools": [
              { "name": "Figma", "url": "https://www.figma.com/", "description": "Standard di settore per UI/UX", "difficulty": "Media", "free": true },
              { "name": "Uizard", "url": "https://uizard.io/", "description": "Genera UI da sketch con AI", "difficulty": "Facile", "free": "Trial" },
              { "name": "Marvel App", "url": "https://marvelapp.com/", "description": "Prototipi cliccabili veloci", "difficulty": "Facile", "free": true },
              { "name": "Canva Whiteboard", "url": "https://www.canva.com/online-whiteboard/", "description": "Mockup e wireframe base", "difficulty": "Facile", "free": true },
              { "name": "Moqups", "url": "https://moqups.com/", "description": "Wireframe e diagrammi", "difficulty": "Facile", "free": true }
            ]
          },
          {
            "category": "🤖 AI Generativa",
            "tools": [
              { "name": "ChatGPT", "url": "https://chat.openai.com/", "description": "Script, copy, brainstorming", "difficulty": "Facile", "free": true },
              { "name": "Claude", "url": "https://claude.ai/", "description": "Analisi, documenti, codice", "difficulty": "Facile", "free": true },
              { "name": "Midjourney", "url": "https://www.midjourney.com/", "description": "Immagini AI per visual", "difficulty": "Media", "free": "Trial" },
              { "name": "DALL-E", "url": "https://openai.com/dall-e-3", "description": "Immagini AI integrate in ChatGPT", "difficulty": "Facile", "free": "Limited" },
              { "name": "Perplexity", "url": "https://www.perplexity.ai/", "description": "Ricerca con fonti", "difficulty": "Facile", "free": true }
            ]
          }
        ],
        "quickStart": [
          { "format": "Video", "combo": "CapCut + HeyGen + Canva per grafiche", "time": "2h" },
          { "format": "Podcast", "combo": "NotebookLM (genera automatico!) + Audacity per edit", "time": "1h" },
          { "format": "Landing", "combo": "Carrd o Framer + Canva per immagini", "time": "1.5h" },
          { "format": "Prototipo", "combo": "Figma + Uizard AI per accelerare", "time": "2.5h" },
          { "format": "Live", "combo": "Canva per visual + prove!", "time": "1.5h" }
        ],
        "proTip": {
          "icon": "💡",
          "title": "Pro Tip: NotebookLM",
          "text": "Caricate i vostri appunti del Pitch Canvas su NotebookLM e generate automaticamente un podcast! Poi editatelo per personalizzarlo. Risparmiate 2 ore di lavoro."
        }
      },
      "videos": [
        {
          "title": "Come usare HeyGen per video AI",
          "source": "Tutorial",
          "duration": "5:00",
          "url": "https://www.youtube.com/results?search_query=heygen+tutorial+italiano",
          "language": "IT"
        },
        {
          "title": "NotebookLM: genera podcast con AI",
          "source": "Google",
          "duration": "3:00",
          "url": "https://www.youtube.com/results?search_query=notebooklm+podcast+tutorial",
          "language": "EN"
        },
        {
          "title": "Figma crash course",
          "source": "Tutorial",
          "duration": "10:00",
          "url": "https://www.youtube.com/results?search_query=figma+tutorial+italiano+base",
          "language": "IT"
        }
      ],
      "articles": [],
      "links": []
    },
    {
      "id": 5,
      "section": "Teams",
      "title": "Le 8 Squadre",
      "type": "teams",
      "visualContent": {
        "introParagraph": "Ecco le squadre in gara con le loro idee. Ogni team ha un focus diverso - scoprite cosa stanno costruendo!",
        "teams": [
          {
            "name": "WineFashion",
            "points": 3368,
            "members": ["Tommaso V.", "Giacomo B.", "Alice P.", "Daniele R."],
            "color": "#EF4444",
            "ideaHint": "Wine + Fashion + Gen Z",
            "techFocus": ["AR/VR", "Social Commerce"]
          },
          {
            "name": "LabelWine",
            "points": 3265,
            "members": ["Luca S.", "Simone M.", "Alessandro C.", "Filippo G.", "Simone M."],
            "color": "#F97316",
            "ideaHint": "Smart Label + Tracciabilità",
            "techFocus": ["Blockchain", "QR/NFC"]
          },
          {
            "name": "T-WINE",
            "points": 2854,
            "members": ["Pier Luigi V.", "Jacopo B.", "Daniele M.", "Tommaso I."],
            "color": "#EAB308",
            "ideaHint": "Wine + Tech + Innovation",
            "techFocus": ["AI", "IoT"]
          },
          {
            "name": "PairMap",
            "points": 2801,
            "members": ["Emanuele C.", "Giulia C.", "Niccolò P.", "Edoardo C."],
            "color": "#22C55E",
            "ideaHint": "Food Pairing + Mapping",
            "techFocus": ["AI", "Recommendation"]
          },
          {
            "name": "LabelAlive",
            "points": 2569,
            "members": ["Jhon V.", "Davide V.", "Lorenzo P."],
            "color": "#14B8A6",
            "ideaHint": "Etichette che prendono vita",
            "techFocus": ["AR", "Storytelling"]
          },
          {
            "name": "UpGrape",
            "points": 2496,
            "members": ["Leonardo D.", "Lorenzo B.", "Viola O."],
            "color": "#3B82F6",
            "ideaHint": "Viticoltura + Upgrade",
            "techFocus": ["IoT", "Precision Viticulture"]
          },
          {
            "name": "WineMaps Go!",
            "points": 2075,
            "members": ["Pietro C.", "Francesco L.", "Filippo F."],
            "color": "#8B5CF6",
            "ideaHint": "Mapping + Enoturismo",
            "techFocus": ["Geolocation", "AR"]
          },
          {
            "name": "CellarSense",
            "points": 2042,
            "members": ["Gabriele T.", "Davide G.", "Nicholas S."],
            "color": "#EC4899",
            "ideaHint": "Cantina Intelligente",
            "techFocus": ["IoT", "AI Monitoring"]
          }
        ],
        "currentLeaderboard": true
      },
      "videos": [],
      "articles": [],
      "links": []
    },
    {
      "id": 6,
      "section": "Voting",
      "title": "Sistema di Voto",
      "type": "voting",
      "visualContent": {
        "introParagraph": "Il punteggio finale combina il giudizio della giuria esterna con il voto dei peer (le altre squadre). Ecco come funziona:",
        "votingSystem": {
          "juryWeight": 70,
          "peerWeight": 30,
          "juryMembers": [
            { "role": "Giuria Esterna", "icon": "👔", "votes": 1, "weight": 70 }
          ],
          "peerVoting": {
            "enabled": true,
            "rules": [
              "Ogni squadra vota le altre 7 (NON può votare se stessa)",
              "Assegna da 1 a 5 stelle per ogni criterio",
              "Il voto è anonimo",
              "Tempo: 5 minuti dopo tutte le presentazioni"
            ]
          }
        },
        "votingCriteria": [
          { "id": "innovation", "name": "Innovazione", "emoji": "💡", "description": "Originalità dell'idea", "maxScore": 5 },
          { "id": "feasibility", "name": "Fattibilità", "emoji": "🔧", "description": "Si può realizzare?", "maxScore": 5 },
          { "id": "impact", "name": "Impatto", "emoji": "🎯", "description": "Valore per il settore", "maxScore": 5 },
          { "id": "pitch", "name": "Qualità Pitch", "emoji": "🎬", "description": "Efficacia comunicativa", "maxScore": 5 },
          { "id": "tech", "name": "Uso Tech", "emoji": "🤖", "description": "Integrazione tecnologie corso", "maxScore": 5 }
        ],
        "prizes": [
          { "position": "🥇", "label": "1° Classificato", "points": 2000, "badge": "🏆 Hackathon Champion" },
          { "position": "🥈", "label": "2° Classificato", "points": 1000, "badge": "⭐ Runner Up" },
          { "position": "🥉", "label": "3° Classificato", "points": 500, "badge": "🌟 Top Pitcher" },
          { "position": "🎬", "label": "Best Pitch Format", "points": 200, "badge": "🎬 Creative Award" },
          { "position": "🤖", "label": "Best Tech Integration", "points": 200, "badge": "🤖 Tech Master" },
          { "position": "💡", "label": "Most Innovative", "points": 200, "badge": "💡 Innovation Award" }
        ],
        "alertBox": {
          "type": "info",
          "icon": "📊",
          "title": "Come si calcola il punteggio",
          "text": "<strong>Punteggio Finale</strong> = (Media Giuria × 0.7) + (Media Peer × 0.3) → convertito in punti piattaforma"
        }
      },
      "videos": [],
      "articles": [],
      "links": []
    },
    {
      "id": 7,
      "section": "Timeline",
      "title": "Timeline della Giornata",
      "type": "timeline",
      "visualContent": {
        "introParagraph": "5 ore intense, ogni minuto conta! Ecco la scaletta dettagliata:",
        "schedule": [
          {
            "time": "09:00 - 09:15",
            "duration": 15,
            "phase": "Kick-off",
            "description": "Benvenuto, regole, domande",
            "color": "#8B5CF6",
            "icon": "🎬"
          },
          {
            "time": "09:15 - 10:00",
            "duration": 45,
            "phase": "Pitch Canvas",
            "description": "Compilate il wizard guidato (7 step × 5 min + buffer)",
            "color": "#3B82F6",
            "icon": "📋",
            "milestone": "Canvas completato"
          },
          {
            "time": "10:00 - 10:15",
            "duration": 15,
            "phase": "Pausa",
            "description": "Rifiatate, discutete la strategia",
            "color": "#6B7280",
            "icon": "☕"
          },
          {
            "time": "10:15 - 12:45",
            "duration": 150,
            "phase": "Creazione",
            "description": "Producete il vostro pitch! Usate i tool, chiedete aiuto",
            "color": "#10B981",
            "icon": "💻",
            "checkpoints": [
              { "time": "11:00", "check": "Formato scelto, tool configurati" },
              { "time": "12:00", "check": "Prima bozza pronta" }
            ]
          },
          {
            "time": "12:45 - 13:15",
            "duration": 30,
            "phase": "Pranzo",
            "description": "Mangiate qualcosa!",
            "color": "#6B7280",
            "icon": "🍕"
          },
          {
            "time": "13:15 - 13:45",
            "duration": 30,
            "phase": "Finalizzazione",
            "description": "Ultimi ritocchi, upload, prove",
            "color": "#F59E0B",
            "icon": "✨",
            "milestone": "Pitch uploadato"
          },
          {
            "time": "13:45 - 14:30",
            "duration": 45,
            "phase": "Presentazioni",
            "description": "8 team × 5 min + 30 sec cambio",
            "color": "#EF4444",
            "icon": "🎤",
            "order": "Ordine casuale estratto"
          },
          {
            "time": "14:30 - 14:45",
            "duration": 15,
            "phase": "Voting & Premi",
            "description": "Voto peer, delibera giuria, premiazione",
            "color": "#EC4899",
            "icon": "🏆",
            "milestone": "Vincitori annunciati!"
          }
        ],
        "tips": [
          { "icon": "⏱️", "text": "Mettete un timer! Il tempo vola" },
          { "icon": "📱", "text": "Dividetevi i compiti: chi fa cosa" },
          { "icon": "🆘", "text": "Chiedete aiuto se bloccati - il docente è lì per questo" },
          { "icon": "🎯", "text": "Better done than perfect - finite qualcosa!" }
        ]
      },
      "videos": [],
      "articles": [],
      "links": []
    },
    {
      "id": 8,
      "section": "Leaderboard",
      "title": "Leaderboard Finale",
      "type": "leaderboard",
      "visualContent": {
        "introParagraph": "La classifica si aggiorna in tempo reale durante il voting. I punti hackathon si sommano ai punti accumulati durante il corso!",
        "leaderboardConfig": {
          "showPreHackathonPoints": true,
          "showHackathonPoints": true,
          "showTotalPoints": true,
          "showBadges": true,
          "animated": true
        },
        "currentStandings": [
          { "rank": 1, "team": "WineFashion", "prePoints": 3368, "hackPoints": 0, "total": 3368, "badges": [] },
          { "rank": 2, "team": "LabelWine", "prePoints": 3265, "hackPoints": 0, "total": 3265, "badges": [] },
          { "rank": 3, "team": "T-WINE", "prePoints": 2854, "hackPoints": 0, "total": 2854, "badges": [] },
          { "rank": 4, "team": "PairMap", "prePoints": 2801, "hackPoints": 0, "total": 2801, "badges": [] },
          { "rank": 5, "team": "LabelAlive", "prePoints": 2569, "hackPoints": 0, "total": 2569, "badges": [] },
          { "rank": 6, "team": "UpGrape", "prePoints": 2496, "hackPoints": 0, "total": 2496, "badges": [] },
          { "rank": 7, "team": "WineMaps Go!", "prePoints": 2075, "hackPoints": 0, "total": 2075, "badges": [] },
          { "rank": 8, "team": "CellarSense", "prePoints": 2042, "hackPoints": 0, "total": 2042, "badges": [] }
        ],
        "pointsBreakdown": {
          "firstPlace": { "jury": 350, "peer": 150, "total": 500 },
          "secondPlace": { "jury": 210, "peer": 90, "total": 300 },
          "thirdPlace": { "jury": 140, "peer": 60, "total": 200 },
          "specialAwards": 100
        },
        "possibleBadges": [
          { "id": "champion", "name": "Hackathon Champion", "emoji": "🏆", "description": "Vincitore assoluto" },
          { "id": "runner", "name": "Runner Up", "emoji": "⭐", "description": "Secondo classificato" },
          { "id": "top3", "name": "Top Pitcher", "emoji": "🌟", "description": "Terzo classificato" },
          { "id": "creative", "name": "Creative Award", "emoji": "🎬", "description": "Miglior formato pitch" },
          { "id": "tech", "name": "Tech Master", "emoji": "🤖", "description": "Miglior uso tecnologie" },
          { "id": "innovation", "name": "Innovation Award", "emoji": "💡", "description": "Idea più innovativa" },
          { "id": "peoples", "name": "People's Choice", "emoji": "❤️", "description": "Preferito dal peer voting" }
        ],
        "alertBox": {
          "type": "success",
          "icon": "🔥",
          "title": "Tutto in gioco!",
          "text": "Con 500 punti per il primo, anche le squadre in fondo alla classifica possono rimontare. Dateci dentro!"
        }
      },
      "videos": [],
      "articles": [],
      "links": []
    }
  ]
};
