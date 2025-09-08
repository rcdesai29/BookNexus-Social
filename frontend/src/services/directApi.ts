// Direct API service to bypass OpenAPI issues
let cachedBooksData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export const directApiService = {
  async getGoogleBooks(query: string = 'bestsellers', maxResults: number = 20): Promise<any> {
    // Use cache for trending/bestsellers queries to improve performance
    if ((query === 'bestsellers' || query === 'trending') && cachedBooksData && (Date.now() - cacheTime < CACHE_DURATION)) {
      console.log('Using cached books data for better performance');
      return cachedBooksData;
    }
    try {
      let endpoint = '';
      
      if (query === 'bestsellers' || query === 'trending') {
        endpoint = `http://localhost:8088/api/v1/google-books/trending?maxResults=${maxResults}`;
      } else if (query === 'popular') {
        endpoint = `http://localhost:8088/api/v1/google-books/popular?category=fiction&maxResults=${maxResults}`;
      } else {
        endpoint = `http://localhost:8088/api/v1/google-books/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=0`;
      }
      
      console.log('Making direct API call to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Cache the results for trending/bestsellers queries
      if (query === 'bestsellers' || query === 'trending') {
        cachedBooksData = data;
        cacheTime = Date.now();
        console.log('Cached books data for improved performance');
      }
      
      return data;
    } catch (error) {
      console.error('Direct API call failed:', error);
      throw error;
    }
  },

  async getBookById(googleBookId: string): Promise<any> {
    try {
      const endpoint = `http://localhost:8088/api/v1/google-books/${googleBookId}`;
      console.log('Making direct API call to get book by ID:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Book API Response:', data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch book by ID:', error);
      throw error;
    }
  }
};