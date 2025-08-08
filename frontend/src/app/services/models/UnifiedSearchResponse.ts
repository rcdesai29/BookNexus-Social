import { BookResponse } from './BookResponse';
import { GoogleBookSearchResult } from './GoogleBookSearchResult';

export interface UnifiedSearchResponse {
  localBooks: BookResponse[];
  googleBooks: GoogleBookSearchResult[];
  query: string;
  totalLocalResults: number;
  totalGoogleResults: number;
  totalResults: number;
}
