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
1. Dividi il contenuto in massimo 6-8 slide (non di più!)
2. Ogni slide DEVE avere: id, section, title, contenuto (contenuto max 200 parole)
3. stats, videos, articles, links, quiz, noteDocente sono OPZIONALI - usali con parsimonia
4. Aggiungi statistiche (stats) SOLO dove ci sono numeri nel testo originale (max 4 stats per slide)
5. Per i video, massimo 2 per slide, solo se pertinenti
6. Per gli articoli, massimo 2 per slide
7. Crea solo 2-3 quiz in tutto il modulo
8. Le noteDocente: speech max 150 parole, max 3 obiettivi, max 2 note, max 2 domande
9. Usa emoji appropriate
10. Contenuto in ITALIANO
11. IMPORTANTE: Il JSON deve essere compatto e valido. Non superare i limiti indicati.

Rispondi SOLO con il JSON valido, senza markdown code blocks, senza commenti.`;

export async function POST(request: NextRequest) {
  try {
    const { markdown } = await request.json();

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
