import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Sei un esperto di design didattico per l'ITS AgriFood Academy. Trasforma il contenuto Markdown in un modulo didattico interattivo e VISIVAMENTE RICCO in formato JSON.

Il JSON deve seguire ESATTAMENTE questa struttura:

{
  "titolo": "string",
  "descrizione": "string (1-2 frasi)",
  "durata": "string es. '45 minuti'",
  "icon": "string emoji",
  "slides": [
    {
      "id": number,
      "section": "string - nome sezione",
      "title": "string - titolo slide",
      "contenuto": "string - breve testo introduttivo (2-3 frasi max, il resto va nei componenti visivi)",
      "visualContent": { /* COMPONENTI VISIVI - vedi catalogo sotto */ },
      "videos": [],
      "articles": [],
      "links": [],
      "quiz": null,
      "noteDocente": {
        "durata": "string es. '8-10 min'",
        "obiettivi": ["string - obiettivo didattico 1", "string - obiettivo 2"],
        "speech": "string - testo guida per il docente (cosa dire, come presentare, suggerimenti)",
        "note": ["string - nota pratica per il docente"],
        "domande": ["string - domanda da porre agli studenti per stimolare discussione"]
      }
    }
  ]
}

## NOTE DOCENTE (noteDocente)
OGNI slide DEVE avere noteDocente generate automaticamente dal contenuto. Includi:
- **durata**: tempo stimato per presentare la slide (es. "8-10 min")
- **obiettivi**: 2-3 obiettivi didattici specifici della slide
- **speech**: testo guida per il docente (100-150 parole) con suggerimenti su come presentare, cosa enfatizzare, aneddoti da raccontare, domande retoriche da fare
- **note**: 1-2 note pratiche (es. "Mostra il video prima di spiegare", "Fai fare un brainstorming")
- **domande**: 1-2 domande da porre agli studenti per stimolare la discussione

## CATALOGO COMPONENTI VISIVI (visualContent)

OGNI slide deve usare 2-3 componenti diversi dal catalogo. NON usare sempre gli stessi! Ecco i componenti disponibili:

### 1. HERO BANNER (solo per slide 1)
"heroBanner": { "emoji": "🚀", "title": "Titolo Grande", "description": "Sottotitolo" }

### 2. STATISTICHE (mainStats) - numeri animati
"mainStats": [
  { "value": 586.9, "label": "Miliardi di euro", "suffix": "Mld", "prefix": "€" },
  { "value": 41, "label": "Aziende digitalizzate", "suffix": "%" }
]
NOTA: "value" deve essere NUMERO per animazione, o STRINGA per valori complessi.

### 3. TEMI/TAG (themes) - card orizzontali
"themes": [
  { "icon": "🔗", "label": "Supply Chain 4.0" },
  { "icon": "🌱", "label": "Sostenibilità" }
]

### 4. TECNOLOGIE (technologies) - card con barra adozione
"technologies": [
  { "name": "IoT & Sensori", "adoption": 62, "icon": "📡", "description": "Monitoraggio real-time" }
]

### 5. TIMELINE - eventi cronologici verticali
"timeline": [
  { "year": "2020", "title": "Evento", "description": "Cosa è successo" }
]

### 6. SUPPLY CHAIN - diagramma filiera
"supplyChain": [
  { "name": "Produzione", "icon": "🌾", "description": "Coltivazione" },
  { "name": "Trasformazione", "icon": "🏭", "description": "Lavorazione" }
]

### 7. OBIETTIVI/PROGRESS (farmToForkTargets) - barre progresso
"farmToForkTargets": [
  { "label": "Riduzione pesticidi", "current": 30, "target": 50, "year": 2030 }
]

### 8. ALERT BOX - messaggi importanti
"alertBox": { "type": "warning", "icon": "⚠️", "title": "Attenzione", "text": "Messaggio" }
Tipi: "info", "warning", "success", "error"

### 9. CITAZIONE (quote)
"quote": { "text": "La citazione", "author": "Nome Autore", "role": "Ruolo" }

### 10. PARAGRAFO INTRO
"introParagraph": "Testo con <strong>HTML</strong> supportato"

### 11. LISTE STRUTTURATE
"vantaggi": [{ "icon": "✅", "label": "Tracciabilità completa" }]
"challenges": [{ "icon": "⚠️", "label": "Costi elevati" }]
"solutions": [{ "icon": "💡", "label": "Approccio graduale" }]
"trends": [{ "icon": "📈", "label": "Crescita IoT" }]

### 12. SEZIONI CON LISTE (sections)
"sections": [{ "title": "Vantaggi", "icon": "✨", "items": ["Punto 1", "Punto 2"] }]

### 13. SUGGERIMENTI (suggestions) - box colorati
"suggestions": [{ "title": "Per approfondire", "items": ["Guarda il video", "Leggi il report"], "color": "blue" }]
Colori: "blue", "green", "yellow", "red", "purple"

### 14. FONTI ISTITUZIONALI
"institutionalSources": [{ "name": "ISMEA", "icon": "📊", "url": "https://www.ismea.it" }]

### 15. QUIZ INTERATTIVO (dentro visualContent)
"quiz": { "question": "Domanda?", "options": ["A", "B", "C", "D"], "correctIndex": 1, "explanation": "Spiegazione" }

## RISORSE (fuori da visualContent)

### Video
"videos": [{ "title": "Titolo", "source": "YouTube", "duration": "5:30", "url": "https://...", "language": "IT", "thumbnailColor": "blue" }]

### Articoli
"articles": [{ "title": "Titolo", "source": "ISMEA", "type": "Report", "url": "https://...", "year": "2024" }]

### Link
"links": [{ "title": "Portale", "source": "ISMEA", "url": "https://...", "icon": "📊" }]

## REGOLE CRITICHE PER LA VARIETÀ

1. **ALTERNA i componenti** - OGNI slide deve avere un layout DIVERSO dalla precedente. MAI usare sempre solo mainStats + introParagraph!
2. Slide 1: heroBanner + themes + mainStats (introduzione accattivante)
3. Slide con numeri/dati: mainStats o technologies con barre di adozione
4. Slide storiche: timeline
5. Slide su processi/filiera: supplyChain
6. Slide su obiettivi: farmToForkTargets
7. Slide concettuali: quote + sections o vantaggi/challenges/solutions
8. Slide di approfondimento: alertBox + suggestions
9. Quiz: 1 quiz ogni 2-3 slide (dentro visualContent)
10. Max 6-8 slide per modulo
11. "contenuto" deve essere BREVE (2-3 frasi) - il contenuto ricco va nei componenti visualContent
12. Video e articoli: includi quelli dal markdown originale con URL reali
13. Contenuto in ITALIANO
14. Il JSON deve essere valido e compatto
15. **OGNI slide DEVE avere noteDocente** - genera speech, obiettivi, note e domande dal contenuto

Rispondi SOLO con il JSON valido, senza markdown code blocks, senza commenti.`;

const SYSTEM_PROMPT_WITH_SPEECH = `Sei un esperto di design didattico per l'ITS AgriFood Academy. Trasforma il contenuto Markdown in un modulo didattico interattivo e VISIVAMENTE RICCO in formato JSON, INTEGRANDO le note docente fornite separatamente.

Il JSON deve seguire ESATTAMENTE questa struttura:

{
  "titolo": "string",
  "descrizione": "string (1-2 frasi)",
  "durata": "string es. '45 minuti'",
  "icon": "string emoji",
  "slides": [
    {
      "id": number,
      "section": "string - nome sezione",
      "title": "string - titolo slide",
      "contenuto": "string - breve testo introduttivo (2-3 frasi max)",
      "visualContent": { /* COMPONENTI VISIVI */ },
      "videos": [],
      "articles": [],
      "links": [],
      "quiz": null,
      "noteDocente": {
        "durata": "string",
        "obiettivi": ["string"],
        "speech": "string",
        "note": ["string"],
        "domande": ["string"]
      }
    }
  ]
}

## CATALOGO COMPONENTI VISIVI (visualContent)

OGNI slide deve usare 2-3 componenti diversi. NON usare sempre gli stessi!

### Componenti disponibili:
1. **heroBanner**: { "emoji": "🚀", "title": "Titolo", "description": "Sotto" } - solo slide 1
2. **mainStats**: [{ "value": 42, "label": "Testo", "suffix": "%", "prefix": "€" }] - numeri animati
3. **themes**: [{ "icon": "🔗", "label": "Tag" }] - tag orizzontali
4. **technologies**: [{ "name": "IoT", "adoption": 62, "icon": "📡", "description": "Desc" }] - barre progresso
5. **timeline**: [{ "year": "2020", "title": "Evento", "description": "Desc" }] - eventi verticali
6. **supplyChain**: [{ "name": "Fase", "icon": "🌾", "description": "Desc" }] - diagramma filiera
7. **farmToForkTargets**: [{ "label": "Obiettivo", "current": 30, "target": 50, "year": 2030 }] - barre obiettivo
8. **alertBox**: { "type": "warning|info|success|error", "icon": "⚠️", "title": "Titolo", "text": "Msg" }
9. **quote**: { "text": "Citazione", "author": "Nome", "role": "Ruolo" }
10. **introParagraph**: "Testo con <strong>HTML</strong>"
11. **vantaggi**: [{ "icon": "✅", "label": "Testo" }] - lista vantaggi
12. **challenges**: [{ "icon": "⚠️", "label": "Testo" }] - lista sfide
13. **solutions**: [{ "icon": "💡", "label": "Testo" }] - lista soluzioni
14. **trends**: [{ "icon": "📈", "label": "Testo" }] - lista trend
15. **sections**: [{ "title": "Titolo", "icon": "✨", "items": ["Punto 1"] }]
16. **suggestions**: [{ "title": "Titolo", "items": ["Punto"], "color": "blue|green|yellow|red|purple" }]
17. **institutionalSources**: [{ "name": "ISMEA", "icon": "📊", "url": "https://..." }]
18. **quiz**: { "question": "?", "options": ["A","B","C","D"], "correctIndex": 1, "explanation": "Perché" }

## REGOLE PER LA VARIETÀ
1. OGNI slide deve avere layout DIVERSO dalla precedente
2. Slide 1: heroBanner + themes + mainStats
3. Slide dati: mainStats o technologies
4. Slide storiche: timeline
5. Slide processi: supplyChain
6. Slide obiettivi: farmToForkTargets
7. Slide concettuali: quote + sections/vantaggi/challenges
8. Quiz: 1 ogni 2-3 slide (dentro visualContent)
9. Max 6-8 slide, contenuto BREVE (2-3 frasi), dettagli nei componenti
10. ITALIANO, JSON valido e compatto

## NOTE DOCENTE (SPEECH MARKDOWN)
- File separato diviso in sezioni con "---"
- Ogni sezione → una slide, IN ORDINE
- Estrai: durata, obiettivi (array), speech, note (array), domande (array)
- OGNI slide DEVE avere noteDocente

Rispondi SOLO con il JSON valido, senza markdown code blocks, senza commenti.`;

export async function POST(request: NextRequest) {
  try {
    const { markdown, speechMarkdown } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    // Usa API key dall'env (configurata in Vercel)
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'API key non configurata. Configura ANTHROPIC_API_KEY nelle variabili ambiente di Vercel.' },
        { status: 500 }
      );
    }

    // Costruisci il messaggio user in base alla presenza del speechMarkdown
    let userMessage = `Ecco il contenuto Markdown da trasformare in un modulo didattico:\n\n${markdown}`;

    if (speechMarkdown) {
      userMessage += `\n\n--- SPEECH MARKDOWN (Note Docente) ---\n\n${speechMarkdown}`;
    }

    // Scegli il prompt di sistema appropriato
    const systemPrompt = speechMarkdown ? SYSTEM_PROMPT_WITH_SPEECH : SYSTEM_PROMPT;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: `Claude API error: ${errorData.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: 'No content received from Claude' },
        { status: 500 }
      );
    }

    // Parse il JSON dalla risposta
    // Rimuovi eventuali markdown code blocks e whitespace
    let cleanContent = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Trova il JSON object nella risposta
    const jsonStartIndex = cleanContent.indexOf('{');
    const jsonEndIndex = cleanContent.lastIndexOf('}');

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      return NextResponse.json(
        { error: 'No JSON object found in Claude response', raw: content.substring(0, 500) },
        { status: 500 }
      );
    }

    const jsonString = cleanContent.substring(jsonStartIndex, jsonEndIndex + 1);

    try {
      const moduleData = JSON.parse(jsonString);
      return NextResponse.json({ module: moduleData });
    } catch (parseError) {
      // Prova a fixare problemi comuni nel JSON
      try {
        // Rimuovi virgole finali prima di } o ]
        const fixedJson = jsonString
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        const moduleData = JSON.parse(fixedJson);
        return NextResponse.json({ module: moduleData });
      } catch {
        return NextResponse.json(
          {
            error: 'Failed to parse module JSON from Claude response',
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
            raw: jsonString.substring(0, 1000)
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Generate module error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
