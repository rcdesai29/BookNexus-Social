// Direct API service to bypass OpenAPI issues
export const directApiService = {
  async getGoogleBooks(query: string = 'bestsellers', maxResults: number = 20): Promise<any> {
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
      
      return data;
    } catch (error) {
      console.error('Direct API call failed:', error);
      throw error;
    }
  }
};