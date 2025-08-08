export interface GoogleBookSearchResult {
  googleId: string;
  title: string;
  authorName: string;
  description?: string;
  isbn?: string;
  thumbnailUrl?: string;
  publishedDate?: string;
  category?: string;
}
