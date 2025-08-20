import { useEffect, useState } from 'react';
import { UserBookList, UserBookListService } from '../app/services/services/UserBookListService';
import { useAuth } from './useAuth';

export function useUserBookList(listType?: 'FAVORITE' | 'CURRENTLY_READING' | 'TBR' | 'READ') {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<UserBookList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      setError(null);
      setData([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let result: UserBookList[];
      
      if (listType) {
        // Fetch specific list type
        result = await UserBookListService.getUserBooksByListType(listType);
      } else {
        // Fetch all books across all lists
        result = await UserBookListService.getAllUserBooks();
      }
      setData(result || []);
    } catch (err) {
      console.error('Error fetching user books:', err);
      setError(err);
      // Set empty array on error so user sees empty state instead of error
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn, listType]);

  const refetch = () => {
    fetchData();
  };

  const moveToShelf = async (bookId: string, fromShelf: string, toShelf: string) => {
    try {
      // Remove from current shelf
      await UserBookListService.removeGoogleBookFromList(bookId, fromShelf as any);
      // Add to new shelf
      await UserBookListService.addGoogleBookToList(bookId, toShelf as any);
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Failed to move book to shelf:', error);
      throw error;
    }
  };

  const removeFromLibrary = async (bookId: string) => {
    try {
      // Find the book to determine its current shelf
      const book = data.find(item => 
        (item.googleBook?.googleBookId === bookId) || 
        (item.book?.id?.toString() === bookId)
      );
      
      if (book && book.listType) {
        await UserBookListService.removeGoogleBookFromList(bookId, book.listType);
        // Refresh data
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to remove book from library:', error);
      throw error;
    }
  };

  const markAsFinished = async (bookId: string) => {
    try {
      // Move from currently reading to read
      await moveToShelf(bookId, 'CURRENTLY_READING', 'READ');
    } catch (error) {
      console.error('Failed to mark book as finished:', error);
      throw error;
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refetch, 
    moveToShelf, 
    removeFromLibrary, 
    markAsFinished 
  };
}