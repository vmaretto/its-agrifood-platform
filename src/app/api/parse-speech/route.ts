import { NextRequest, NextResponse } from 'next/server';

// API per parsare SOLO il file speech MD e ritornare le noteDocente strutturate
// Questo permette di aggiungere speech a moduli esistenti (statici o dinamici)
// senza dover rigenerare tutto il modulo

const PARSE_SPEECH_PROMPT = `Sei un esperto di didattica. Ti viene fornito un file Markdown con le note docente per le slide di un corso.

Il file è diviso in sezioni separate da "---". Ogni sezione corrisponde ad una slide.

Per ogni sezione, estrai i seguenti campi nel formato JSON:
- durata: stringa con la durata stimata (es. "8-10 min")
- obiettivi: array di stringhe con gli obiettivi
- speech: stringa con il testo dello speech completo
- note: array di stringhe con le note importanti
- domande: array di stringhe con le domande suggerite

Il formato del file è:
# Titolo Slide
**Durata:** X-Y min
**Obiettivi:**
- Obiettivo 1
- Obiettivo 2
**Speech:**
Testo dello speech...
**Note:**
- Nota 1
**Domande:**
- Domanda 1?
---

Rispondi SOLO con un JSON array di oggetti noteDocente, uno per ogni sezione:
[
  {
    "slideTitle": "string - titolo della slide dalla sezione",
    "durata": "string",
    "obiettivi": ["string"],
    "speech": "string",
    "note": ["string"],
    "domande": ["string"]
  }
]

Rispondi SOLO con il JSON valido, senza markdown code blocks.`;

export async function POST(request: NextRequest) {
  try {
    const { speechMarkdown } = await request.json();

    if (!speechMarkdown) {
      return NextResponse.json(
        { error: 'Speech markdown content is required' },
        { status: 400 }
      );
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'API key non configurata.' },
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
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: `Ecco il file Markdown con le note docente da parsare:\n\n${speechMarkdown}`,
          },
        ],
        system: PARSE_SPEECH_PROMPT,
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
    let cleanContent = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const jsonStartIndex = cleanContent.indexOf('[');
    const jsonEndIndex = cleanContent.lastIndexOf(']');

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      return NextResponse.json(
        { error: 'No JSON array found in Claude response', raw: content.substring(0, 500) },
        { status: 500 }
      );
    }

    const jsonString = cleanContent.substring(jsonStartIndex, jsonEndIndex + 1);

    try {
      const noteDocente = JSON.parse(jsonString);
      return NextResponse.json({ noteDocente });
    } catch (parseError) {
      // Prova a fixare problemi comuni
      try {
        const fixedJson = jsonString
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        const noteDocente = JSON.parse(fixedJson);
        return NextResponse.json({ noteDocente });
      } catch {
        return NextResponse.json(
          {
            error: 'Failed to parse noteDocente JSON',
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
            raw: jsonString.substring(0, 500)
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Parse speech error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
