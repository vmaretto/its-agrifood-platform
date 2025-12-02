/**
 * Parser per file JSX/JSON dei Moduli
 *
 * Supporta due formati:
 * 1. JSON diretto con struttura ModuleJSON
 * 2. JSX con export di oggetto modulo
 *
 * Il parser estrae:
 * - Metadati modulo (titolo, descrizione, icona, durata)
 * - Slides con contenuto, video, articoli, link, quiz
 */

import { ModuleJSON, SlideJSON, VideoItem, ArticleItem, LinkItem, QuizItem, VisualContent } from '@/types/module';

export interface ParseResult {
  success: boolean;
  module?: ModuleJSON;
  error?: string;
  warnings?: string[];
}

/**
 * Parsa contenuto JSX/JSON e restituisce un ModuleJSON
 */
export function parseModuleContent(content: string): ParseResult {
  const warnings: string[] = [];

  // Prova prima come JSON puro
  try {
    const jsonModule = JSON.parse(content);
    if (isValidModuleJSON(jsonModule)) {
      return { success: true, module: normalizeModule(jsonModule), warnings };
    }
  } catch {
    // Non è JSON puro, proviamo a estrarre da JSX
  }

  // Prova a estrarre oggetto da JSX
  try {
    const extracted = extractModuleFromJsx(content);
    if (extracted) {
      return { success: true, module: normalizeModule(extracted), warnings };
    }
  } catch (e) {
    return {
      success: false,
      error: `Errore nel parsing JSX: ${e instanceof Error ? e.message : 'Errore sconosciuto'}`,
      warnings,
    };
  }

  return {
    success: false,
    error: 'Formato non riconosciuto. Usa JSON valido o JSX con export del modulo.',
    warnings,
  };
}

/**
 * Estrae oggetto modulo da codice JSX
 */
function extractModuleFromJsx(jsxContent: string): ModuleJSON | null {
  // Pattern per trovare export default o const con oggetto modulo
  const patterns = [
    // export default { ... }
    /export\s+default\s+(\{[\s\S]*\})\s*;?\s*$/,
    // const modulo = { ... }
    /const\s+\w+\s*=\s*(\{[\s\S]*\})\s*;?\s*(?:export|$)/,
    // module.exports = { ... }
    /module\.exports\s*=\s*(\{[\s\S]*\})\s*;?\s*$/,
  ];

  for (const pattern of patterns) {
    const match = jsxContent.match(pattern);
    if (match && match[1]) {
      try {
        // Usa Function constructor per valutare l'oggetto (più sicuro di eval)
        // eslint-disable-next-line no-new-func
        const evalFn = new Function(`return ${match[1]}`);
        const obj = evalFn();
        if (isValidModuleJSON(obj)) {
          return obj;
        }
      } catch {
        continue;
      }
    }
  }

  // Prova a trovare un oggetto ModuleJSON inline
  const inlineMatch = jsxContent.match(/\{[\s\S]*"id"\s*:\s*"[^"]+"\s*,[\s\S]*"slides"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
  if (inlineMatch) {
    try {
      const obj = JSON.parse(inlineMatch[0].replace(/'/g, '"'));
      if (isValidModuleJSON(obj)) {
        return obj;
      }
    } catch {
      // Continua
    }
  }

  // Prova a estrarre slidesData da componenti React complessi
  const slidesDataExtracted = extractSlidesDataFromComponent(jsxContent);
  if (slidesDataExtracted) {
    return slidesDataExtracted;
  }

  return null;
}

/**
 * Estrae una costante JavaScript (oggetto o array) dal contenuto
 */
function extractConstant(jsxContent: string, constName: string): string | null {
  const regex = new RegExp(`const\\s+${constName}\\s*=\\s*`);
  const match = jsxContent.match(regex);
  if (!match) return null;

  const startSearch = match.index! + match[0].length;
  const firstChar = jsxContent[startSearch];

  if (firstChar !== '{' && firstChar !== '[') return null;

  const openBracket = firstChar;
  const closeBracket = openBracket === '{' ? '}' : ']';

  let bracketCount = 1;
  let endIndex = startSearch + 1;

  while (bracketCount > 0 && endIndex < jsxContent.length) {
    const char = jsxContent[endIndex];
    if (char === openBracket) bracketCount++;
    else if (char === closeBracket) bracketCount--;
    endIndex++;
  }

  if (bracketCount !== 0) return null;

  return jsxContent.substring(startSearch, endIndex);
}

/**
 * Estrae slidesData da un componente React (es. ModuloTrendTecnologici)
 * Cerca pattern come: const slidesData = [ ... ];
 */
function extractSlidesDataFromComponent(jsxContent: string): ModuleJSON | null {
  // Cerca il pattern "const slidesData = ["
  const slidesDataMatch = jsxContent.match(/const\s+slidesData\s*=\s*\[/);
  if (!slidesDataMatch) return null;

  const startIndex = slidesDataMatch.index! + slidesDataMatch[0].length - 1;

  // Trova la fine dell'array bilanciando le parentesi
  let bracketCount = 1;
  let endIndex = startIndex + 1;

  while (bracketCount > 0 && endIndex < jsxContent.length) {
    const char = jsxContent[endIndex];
    if (char === '[') bracketCount++;
    else if (char === ']') bracketCount--;
    endIndex++;
  }

  if (bracketCount !== 0) return null;

  const arrayContent = jsxContent.substring(startIndex, endIndex);

  // Estrai anche il nome del modulo dall'export default function
  const functionNameMatch = jsxContent.match(/export\s+default\s+function\s+(\w+)/);
  const moduleName = functionNameMatch
    ? functionNameMatch[1].replace(/^Modulo/, '').replace(/([A-Z])/g, ' $1').trim()
    : 'Modulo Importato';

  try {
    // Estrai tutte le costanti MAIUSCOLE definite PRIMA di slidesData
    // Queste potrebbero essere riferite nel slidesData (es. INSTITUTIONAL_SOURCES)
    const contentBeforeSlidesData = jsxContent.substring(0, slidesDataMatch.index!);
    const constantNames: string[] = [];
    const constRegex = /const\s+([A-Z][A-Z_0-9]*)\s*=/g;
    let constMatch;
    while ((constMatch = constRegex.exec(contentBeforeSlidesData)) !== null) {
      constantNames.push(constMatch[1]);
    }

    // Costruisci il codice delle costanti da includere nel contesto
    let constantsCode = '';
    for (const constName of constantNames) {
      const constValue = extractConstant(jsxContent, constName);
      if (constValue) {
        constantsCode += `const ${constName} = ${constValue};\n`;
      }
    }

    // Prova a valutare con le costanti nel contesto
    // eslint-disable-next-line no-new-func
    const evalFn = new Function(`${constantsCode} return ${arrayContent}`);
    const slidesArray = evalFn();

    if (!Array.isArray(slidesArray) || slidesArray.length === 0) return null;

    // Converti slidesData nel formato ModuleJSON
    const slides: SlideJSON[] = slidesArray.map((slide, index) => {
      // Se slide.content esiste, salvalo come visualContent
      // Altrimenti genera un fallback markdown
      let visualContent: VisualContent | undefined;
      let contenuto = '';

      if (slide.content && typeof slide.content === 'object') {
        // Salva content direttamente come visualContent per rendering visivo
        visualContent = slide.content as VisualContent;
        // Genera anche un fallback markdown per backward compatibility
        contenuto = extractContentDescription(slide.content);
      }

      return {
        id: slide.id ?? index + 1,
        section: slide.section || 'Sezione',
        title: slide.title || `Slide ${index + 1}`,
        contenuto: contenuto,
        visualContent: visualContent,
        videos: slide.videos,
        articles: slide.articles,
        links: slide.links,
        quiz: slide.quiz || (slide.hasQuiz ? slide.quiz : undefined),
      };
    });

    return {
      id: generateId(moduleName),
      titolo: moduleName,
      descrizione: `Modulo importato con ${slides.length} slide`,
      durata: '',
      icon: '📚',
      createdAt: new Date().toISOString(),
      slides,
    };
  } catch (e) {
    console.error('Errore parsing slidesData:', e);
    return null;
  }
}

/**
 * Estrae una descrizione testuale dal content object di una slide
 */
function extractContentDescription(content: Record<string, unknown>): string {
  const parts: string[] = [];

  // Estrai mainStats se presenti
  if (content.mainStats && Array.isArray(content.mainStats)) {
    const stats = content.mainStats as Array<{ label?: string; value?: number; suffix?: string }>;
    parts.push('**Statistiche chiave:**');
    stats.forEach(stat => {
      if (stat.label) {
        parts.push(`- ${stat.label}: ${stat.value || ''}${stat.suffix || ''}`);
      }
    });
  }

  // Estrai altre proprietà come liste
  for (const [key, value] of Object.entries(content)) {
    if (key === 'mainStats') continue;

    if (Array.isArray(value)) {
      const items = value as Array<{ title?: string; name?: string; description?: string }>;
      if (items.length > 0 && (items[0].title || items[0].name)) {
        parts.push(`\n**${formatKey(key)}:**`);
        items.forEach(item => {
          const title = item.title || item.name || '';
          const desc = item.description || '';
          parts.push(`- ${title}${desc ? ': ' + desc : ''}`);
        });
      }
    }
  }

  return parts.join('\n');
}

/**
 * Formatta una chiave camelCase in testo leggibile
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Verifica se un oggetto è un ModuleJSON valido
 */
function isValidModuleJSON(obj: unknown): obj is ModuleJSON {
  if (!obj || typeof obj !== 'object') return false;

  const m = obj as Record<string, unknown>;

  // Campi richiesti
  if (typeof m.id !== 'string' && typeof m.titolo !== 'string') return false;
  if (!Array.isArray(m.slides)) return false;

  // Verifica che almeno una slide abbia la struttura minima
  const slides = m.slides as unknown[];
  if (slides.length === 0) return false;

  const firstSlide = slides[0] as Record<string, unknown>;
  if (typeof firstSlide.title !== 'string' && typeof firstSlide.contenuto !== 'string') return false;

  return true;
}

/**
 * Normalizza un modulo assicurando che tutti i campi siano presenti
 */
function normalizeModule(input: unknown): ModuleJSON {
  const data = input as Record<string, unknown>;
  const slides = (data.slides as SlideJSON[]) || [];

  // Normalizza le slide
  const normalizedSlides: SlideJSON[] = slides.map((slide, index) => ({
    id: slide.id ?? index + 1,
    section: slide.section || 'Sezione',
    title: slide.title || `Slide ${index + 1}`,
    contenuto: slide.contenuto || '',
    stats: slide.stats,
    videos: normalizeVideos(slide.videos),
    articles: normalizeArticles(slide.articles),
    links: normalizeLinks(slide.links),
    quiz: slide.quiz,
    noteDocente: slide.noteDocente,
    visualContent: slide.visualContent,
  }));

  return {
    id: (data.id as string) || generateId((data.titolo as string) || 'modulo'),
    titolo: (data.titolo as string) || (data.title as string) || 'Modulo senza titolo',
    descrizione: (data.descrizione as string) || (data.description as string) || '',
    durata: (data.durata as string) || (data.duration as string) || '',
    icon: (data.icon as string) || '',
    createdAt: (data.createdAt as string) || new Date().toISOString(),
    slides: normalizedSlides,
  };
}

function normalizeVideos(videos?: VideoItem[]): VideoItem[] | undefined {
  if (!videos || !Array.isArray(videos)) return undefined;
  return videos.map(v => ({
    title: v.title || 'Video senza titolo',
    source: v.source || '',
    duration: v.duration || '',
    url: v.url || '',
    language: v.language,
    thumbnailColor: v.thumbnailColor,
  }));
}

function normalizeArticles(articles?: ArticleItem[]): ArticleItem[] | undefined {
  if (!articles || !Array.isArray(articles)) return undefined;
  return articles.map(a => ({
    title: a.title || 'Articolo senza titolo',
    source: a.source || '',
    type: a.type || 'Articolo',
    url: a.url || '',
    year: a.year,
    description: a.description,
  }));
}

function normalizeLinks(links?: LinkItem[]): LinkItem[] | undefined {
  if (!links || !Array.isArray(links)) return undefined;
  return links.map(l => ({
    title: l.title || 'Link',
    source: l.source || '',
    url: l.url || '',
    icon: l.icon,
  }));
}

function generateId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/**
 * Crea un ModuleJSON vuoto per iniziare
 */
export function createEmptyModule(titolo: string): ModuleJSON {
  return {
    id: generateId(titolo),
    titolo,
    descrizione: '',
    durata: '',
    icon: '',
    createdAt: new Date().toISOString(),
    slides: [],
  };
}

/**
 * Aggiunge slide vuote al modulo
 */
export function addEmptySlides(module: ModuleJSON, count: number): ModuleJSON {
  const newSlides: SlideJSON[] = [];
  const startId = module.slides.length + 1;

  for (let i = 0; i < count; i++) {
    newSlides.push({
      id: startId + i,
      section: 'Nuova Sezione',
      title: `Slide ${startId + i}`,
      contenuto: '',
    });
  }

  return {
    ...module,
    slides: [...module.slides, ...newSlides],
  };
}
