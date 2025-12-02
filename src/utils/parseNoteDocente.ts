/**
 * Parser per file Markdown delle Note Docente
 *
 * Formato atteso:
 * # Slide N: Titolo
 * ## Durata
 * X minuti
 *
 * ## Obiettivi
 * - Obiettivo 1
 * - Obiettivo 2
 *
 * ## Speech
 * Testo dello speech...
 *
 * ## Note per il Docente
 * - Nota 1
 * - Nota 2
 *
 * ## Domande Suggerite
 * - Domanda 1?
 * - Domanda 2?
 */

import { NoteDocenteItem } from '@/types/module';

export interface ParsedNoteDocente {
  slideNumber: number;
  slideTitle: string;
  note: NoteDocenteItem;
}

/**
 * Parsa un file Markdown con le note docente e restituisce una mappa slideNumber -> NoteDocenteItem
 */
export function parseNoteDocenteMd(mdContent: string): Map<number, NoteDocenteItem> {
  const result = new Map<number, NoteDocenteItem>();

  // Dividi per slide (# Slide N: ...)
  const slideRegex = /^# Slide (\d+):\s*(.+)$/gm;
  const slides = mdContent.split(/(?=^# Slide \d+:)/gm).filter(s => s.trim());

  for (const slideContent of slides) {
    const headerMatch = slideContent.match(/^# Slide (\d+):\s*(.+)$/m);
    if (!headerMatch) continue;

    const slideNumber = parseInt(headerMatch[1], 10);

    const note: NoteDocenteItem = {
      durata: extractSection(slideContent, 'Durata'),
      obiettivi: extractListSection(slideContent, 'Obiettivi'),
      speech: extractSection(slideContent, 'Speech'),
      note: extractListSection(slideContent, 'Note per il Docente'),
      domande: extractListSection(slideContent, 'Domande Suggerite'),
    };

    result.set(slideNumber, note);
  }

  return result;
}

/**
 * Estrae una sezione di testo semplice (es: Durata, Speech)
 */
function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=##|$)`, 'i');
  const match = content.match(regex);
  if (!match) return '';

  return match[1].trim();
}

/**
 * Estrae una sezione con lista puntata (es: Obiettivi, Note, Domande)
 */
function extractListSection(content: string, sectionName: string): string[] {
  const sectionContent = extractSection(content, sectionName);
  if (!sectionContent) return [];

  // Dividi per righe e filtra quelle che iniziano con - o *
  const lines = sectionContent.split('\n');
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      items.push(trimmed.substring(2).trim());
    } else if (trimmed.match(/^\d+\.\s/)) {
      // Supporta anche liste numerate
      items.push(trimmed.replace(/^\d+\.\s*/, '').trim());
    }
  }

  return items;
}

/**
 * Parsa e restituisce un array con info di debug su ogni slide trovata
 */
export function parseNoteDocenteWithDetails(mdContent: string): ParsedNoteDocente[] {
  const result: ParsedNoteDocente[] = [];

  const slides = mdContent.split(/(?=^# Slide \d+:)/gm).filter(s => s.trim());

  for (const slideContent of slides) {
    const headerMatch = slideContent.match(/^# Slide (\d+):\s*(.+)$/m);
    if (!headerMatch) continue;

    const slideNumber = parseInt(headerMatch[1], 10);
    const slideTitle = headerMatch[2].trim();

    const note: NoteDocenteItem = {
      durata: extractSection(slideContent, 'Durata'),
      obiettivi: extractListSection(slideContent, 'Obiettivi'),
      speech: extractSection(slideContent, 'Speech'),
      note: extractListSection(slideContent, 'Note per il Docente'),
      domande: extractListSection(slideContent, 'Domande Suggerite'),
    };

    result.push({ slideNumber, slideTitle, note });
  }

  return result.sort((a, b) => a.slideNumber - b.slideNumber);
}
