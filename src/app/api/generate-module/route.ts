import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Sei un esperto di didattica e-learning per il settore agroalimentare. Trasforma il seguente contenuto Markdown in un modulo didattico interattivo in formato JSON.

Il JSON deve seguire ESATTAMENTE questa struttura:

{
  "titolo": "string - titolo del modulo",
  "descrizione": "string - breve descrizione del modulo (1-2 frasi)",
  "durata": "string - durata stimata es. '2-3 ore'",
  "icon": "string - emoji rappresentativa del modulo",
  "slides": [
    {
      "id": number,
      "section": "string - nome della sezione/capitolo",
      "title": "string - titolo della slide",
      "contenuto": "string - contenuto principale in formato markdown semplice",
      "stats": [
        {
          "icon": "string - emoji",
          "value": number,
          "suffix": "string - es. '%', 'M', 'B'",
          "label": "string - etichetta",
          "color": "string - es. 'emerald', 'blue', 'purple'"
        }
      ],
      "videos": [
        {
          "title": "string",
          "source": "string - es. 'YouTube', 'Vimeo'",
          "duration": "string - es. '12:30'",
          "url": "string - URL del video",
          "language": "string - es. 'IT', 'EN'"
        }
      ],
      "articles": [
        {
          "title": "string",
          "source": "string - es. 'McKinsey', 'FAO'",
          "type": "string - 'Report', 'Articolo', 'Guida', 'Case Study', 'PDF'",
          "url": "string",
          "year": "string - es. '2024'"
        }
      ],
      "links": [
        {
          "title": "string",
          "source": "string",
          "url": "string",
          "icon": "string - emoji"
        }
      ],
      "quiz": {
        "question": "string - domanda",
        "options": ["string - opzione 1", "string - opzione 2", "string - opzione 3", "string - opzione 4"],
        "correctIndex": number,
        "explanation": "string - spiegazione della risposta corretta"
      },
      "noteDocente": {
        "durata": "string - es. '10-12 min'",
        "obiettivi": ["string - obiettivo 1", "string - obiettivo 2"],
        "speech": "string - testo dello speech per il docente con emoji e formattazione",
        "note": ["string - nota 1", "string - nota 2"],
        "domande": ["string - domanda suggerita 1", "string - domanda suggerita 2"]
      }
    }
  ]
}

REGOLE IMPORTANTI:
1. Dividi il contenuto in 6-12 slide logiche
2. Ogni slide DEVE avere: id, section, title, contenuto
3. stats, videos, articles, links, quiz, noteDocente sono OPZIONALI
4. Aggiungi statistiche (stats) SOLO dove ci sono numeri significativi nel testo
5. Per i video, suggerisci titoli realistici di video YouTube esistenti sul tema
6. Per gli articoli, cita fonti autorevoli (FAO, McKinsey, Deloitte, università, etc.)
7. Crea quiz pertinenti per verificare la comprensione (non per ogni slide, solo 3-4 nel modulo)
8. Le noteDocente devono aiutare il docente a presentare: speech dettagliato, obiettivi, domande per la classe
9. Usa emoji appropriate nei campi icon e nello speech
10. Il contenuto deve essere in ITALIANO

Rispondi SOLO con il JSON valido, senza markdown code blocks, senza commenti, senza testo aggiuntivo.`;

export async function POST(request: NextRequest) {
  try {
    const { markdown, apiKey } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    // Usa API key dall'env o dal body della richiesta
    const anthropicApiKey = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'API key is required. Set ANTHROPIC_API_KEY env variable or provide apiKey in request.' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: `Ecco il contenuto Markdown da trasformare in un modulo didattico:\n\n${markdown}`,
          },
        ],
        system: SYSTEM_PROMPT,
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
    try {
      const moduleData = JSON.parse(content);
      return NextResponse.json({ module: moduleData });
    } catch {
      // Se il parsing fallisce, prova a estrarre il JSON dalla risposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const moduleData = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ module: moduleData });
        } catch {
          return NextResponse.json(
            { error: 'Failed to parse module JSON from Claude response', raw: content },
            { status: 500 }
          );
        }
      }
      return NextResponse.json(
        { error: 'Failed to parse module JSON', raw: content },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generate module error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
