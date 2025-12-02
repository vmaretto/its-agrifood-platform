// Tipi per i moduli dinamici generati da Markdown

export interface StatItem {
  icon: string;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: string;
}

export interface VideoItem {
  title: string;
  source: string;
  duration: string;
  url: string;
  language?: string;
  thumbnailColor?: string;
}

export interface ArticleItem {
  title: string;
  source: string;
  type: 'Report' | 'Articolo' | 'Guida' | 'Case Study' | 'Studio' | 'PDF';
  url: string;
  year?: string;
  description?: string;
}

export interface LinkItem {
  title: string;
  source: string;
  url: string;
  icon?: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NoteDocenteItem {
  durata: string;
  obiettivi: string[];
  speech: string;
  note: string[];
  domande: string[];
}

// Tipi per VisualContent - componenti visivi strutturati

export interface TechItem {
  name: string;
  adoption: number;
  icon?: string;
  description?: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface SupplyChainStage {
  name: string;
  icon: string;
  description: string;
}

export interface FarmToForkTarget {
  label: string;
  current: number;
  target: number;
  year: number;
}

export interface SuggestionItem {
  title: string;
  items: string[];
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export interface SectionItem {
  title: string;
  icon?: string;
  items: string[];
}

export interface InstitutionalSource {
  name: string;
  url: string;
  icon?: string;
}

export interface VisualContent {
  // Stats e metriche
  mainStats?: StatItem[];
  technologies?: TechItem[];
  preferences?: StatItem[];

  // Timeline e diagrammi
  timeline?: TimelineItem[];
  supplyChain?: SupplyChainStage[];
  farmToForkTargets?: FarmToForkTarget[];

  // Quiz (usa QuizItem esistente)
  quiz?: QuizItem;

  // Contenuti testuali strutturati
  sections?: SectionItem[];

  // Suggerimenti
  suggestions?: SuggestionItem[];

  // Fonti istituzionali
  institutionalSources?: InstitutionalSource[];

  // Campi generici per estensibilità
  [key: string]: unknown;
}

export interface SlideJSON {
  id: number;
  section: string;
  title: string;
  contenuto: string;
  stats?: StatItem[];
  videos?: VideoItem[];
  articles?: ArticleItem[];
  links?: LinkItem[];
  quiz?: QuizItem;
  noteDocente?: NoteDocenteItem;
  visualContent?: VisualContent;
}

export interface ModuleJSON {
  id: string;
  titolo: string;
  descrizione: string;
  durata: string;
  icon: string;
  createdAt: string;
  slides: SlideJSON[];
}
