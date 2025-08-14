import { useEffect, useState } from 'react';
import type { PageResponseBookResponse } from '../app/services/models/PageResponseBookResponse';
import { BookService } from '../app/services/services/BookService';
import { tokenService } from '../services/tokenService';

export function useMyBooks(initialPage: number = 0, initialSize: number = 12) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [data, setData] = useState<PageResponseBookResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!tokenService.isLoggedIn()) {
      setLoading(false);
      setError(null);
      setData(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    BookService.findAllBooksByOwner(page, size)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, size]);

  return { data, loading, error, page, setPage, size, setSize };
}
