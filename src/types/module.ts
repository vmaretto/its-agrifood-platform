// Tipi per i moduli dinamici generati da Markdown

export interface StatItem {
  icon?: string;
  value: number | string;  // Può essere numero o stringa (es. '€586,9')
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

// Nuovi tipi per contenuti estesi generati da Claude

export interface HeroBanner {
  emoji?: string;
  title?: string;
  description?: string;
  bgGradient?: string;
}

export interface AlertBoxItem {
  type?: 'info' | 'warning' | 'success' | 'error';
  icon?: string;
  title?: string;
  text?: string;
}

export interface StatBoxItem {
  value?: number | string;
  suffix?: string;
  prefix?: string;
  label?: string;
  description?: string;
  bgColor?: string;
  icon?: string;
}

export interface ListItemContent {
  icon?: string;
  text?: string;
  title?: string;
  label?: string;  // Alternativa a title (usato nel JSX di Claude)
  highlight?: boolean;
  description?: string;
}

export interface ThemeItem {
  title?: string;
  label?: string;  // Alternativa a title (usato nel JSX di Claude)
  description?: string;
  color?: string;
  icon?: string;
}

export interface InfoBoxItem {
  type?: 'case' | 'ai' | 'advantage' | 'genZ' | 'generic';
  icon?: string;
  title?: string;
  description?: string;
  items?: string[];
  bgColor?: string;
}

export interface QuoteItem {
  text?: string;
  author?: string;
  role?: string;
}

export interface ESGItem {
  letter?: string;
  title?: string;
  description?: string;
  color?: string;
  items?: string[];
}

// ============================================
// TIPI PER HACKATHON
// ============================================

export interface HackathonPhase {
  name: string;
  duration: number;
  color: string;
}

export interface HackathonConfig {
  startTime: string;
  endTime: string;
  totalMinutes: number;
  phases: HackathonPhase[];
}

export interface PitchFormat {
  id: string;
  icon: string;
  name: string;
  duration: string;
  description: string;
  tools: string[];
  bestFor: string;
  difficulty: string;
  examples: string[];
}

export interface ScoringCriterion {
  name: string;
  weight: number;
  description: string;
  icon: string;
}

export interface BonusPointItem {
  name: string;
  points: number;
  description: string;
}

export interface WizardStep {
  step: number;
  title: string;
  subtitle: string;
  timeMinutes: number;
  prompts: string[];
  example: {
    team: string;
    content: string;
  };
  output: string;
  color: string;
}

export interface ToolItem {
  name: string;
  url: string;
  description: string;
  difficulty: string;
  free: boolean | string;
}

export interface ToolCategory {
  category: string;
  tools: ToolItem[];
}

export interface QuickStartItem {
  format: string;
  combo: string;
  time: string;
}

export interface HackathonTeam {
  name: string;
  points: number;
  members: string[];
  color: string;
  ideaHint: string;
  techFocus: string[];
}

export interface VotingCriterion {
  id: string;
  name: string;
  emoji: string;
  description: string;
  maxScore: number;
}

export interface Prize {
  position: string;
  label: string;
  points: number;
  badge: string;
}

export interface ScheduleItem {
  time: string;
  duration: number;
  phase: string;
  description: string;
  color: string;
  icon: string;
  milestone?: string;
  order?: string;
  checkpoints?: { time: string; check: string }[];
}

export interface LeaderboardStanding {
  rank: number;
  team: string;
  prePoints: number;
  hackPoints: number;
  total: number;
  badges: string[];
}

export interface HackathonBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface VisualContent {
  // Stats e metriche
  mainStats?: StatItem[];
  technologies?: TechItem[];
  preferences?: StatItem[];

  // Variazioni Stats
  statsGrid?: StatItem[];
  statBox?: StatBoxItem;
  statsRow?: StatItem[];
  mainStat?: StatBoxItem;
  secondaryStat?: StatBoxItem;
  finalStats?: StatItem[];

  // Timeline e diagrammi
  timeline?: TimelineItem[];
  supplyChain?: SupplyChainStage[];
  farmToForkTargets?: FarmToForkTarget[];

  // ESG Items
  esgItems?: ESGItem[];

  // Quiz (usa QuizItem esistente)
  quiz?: QuizItem;

  // Contenuti testuali strutturati
  sections?: SectionItem[];

  // Suggerimenti
  suggestions?: SuggestionItem[];

  // Fonti istituzionali
  institutionalSources?: InstitutionalSource[];

  // Hero/Banner
  heroEmoji?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroBanner?: HeroBanner;

  // Testo strutturato
  introParagraph?: string;
  quote?: QuoteItem;

  // Box informativi
  alert?: AlertBoxItem;
  alertBox?: AlertBoxItem;
  caseBox?: InfoBoxItem;
  aiBox?: InfoBoxItem;
  advantageBox?: InfoBoxItem;
  genZBox?: InfoBoxItem;

  // Liste strutturate
  vantaggi?: ListItemContent[];
  solutions?: ListItemContent[];
  challenges?: ListItemContent[];
  trends?: ListItemContent[];
  themes?: ThemeItem[];
  wineList?: ListItemContent[];

  // Campi generici per estensibilità
  [key: string]: unknown;
}

export interface SlideJSON {
  id: number;
  section: string;
  title: string;
  contenuto?: string;
  type?: 'hero' | 'rules' | 'wizard' | 'resources' | 'teams' | 'voting' | 'timeline' | 'leaderboard';
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
  createdAt?: string;
  tipo?: 'contenuto' | 'quiz' | 'case-study' | 'lab' | 'challenge' | 'hackathon';
  config?: HackathonConfig;
  slides: SlideJSON[];
}
