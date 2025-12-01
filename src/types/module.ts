// Tipi per i moduli dinamici generati da Markdown

export interface StatItem {
  icon: string;
  value: number;
  suffix?: string;
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
