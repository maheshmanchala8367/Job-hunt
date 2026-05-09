export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  sourceCategory: 'api' | 'ats' | 'board' | 'generic';
  postedAt: Date | null;
  salary?: string;
  jobType?: string;
  remote?: boolean;
  description?: string;
  tags?: string[];
}

export interface SearchParams {
  query: string;
  location?: string;
  remote?: boolean;
  sinceHours?: number; // 4 | 8 | 12 | 24 | 168 (week) | undefined = all
  sources?: string[]; // source IDs to include; undefined = all
  companies?: string[]; // for ATS company-specific search
}

export interface SourceResult {
  sourceId: string;
  sourceName: string;
  jobs: ScrapedJob[];
  error?: string;
  durationMs: number;
}

export interface SearchResult {
  jobs: ScrapedJob[];
  sources: SourceResult[];
  totalCount: number;
  filteredCount: number;
  searchedAt: Date;
}

export type ScraperFn = (params: SearchParams) => Promise<ScrapedJob[]>;

export interface SourceDef {
  id: string;
  name: string;
  category: ScrapedJob['sourceCategory'];
  logoUrl?: string;
  scraper: ScraperFn;
  requiresCompanyName?: boolean;
  notes?: string;
}
