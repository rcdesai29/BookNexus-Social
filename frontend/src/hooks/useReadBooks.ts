import { useEffect, useState } from 'react';
import type { PageResponseBorrowedBookResponse } from '../app/services/models/PageResponseBorrowedBookResponse';
import { BookService } from '../app/services/services/BookService';
import { tokenService } from '../services/tokenService';

export function useReadBooks(initialPage: number = 0, initialSize: number = 12) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [data, setData] = useState<PageResponseBorrowedBookResponse | null>(null);
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
    BookService.findAllReadBooks(page, size)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, size]);

  return { data, loading, error, page, setPage, size, setSize };
}
