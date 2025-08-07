import { useEffect, useState } from 'react';
import type { PageResponseBorrowedBookResponse } from '../app/services/models/PageResponseBorrowedBookResponse';
import { BookService } from '../app/services/services/BookService';

export function useBorrowedBooks(initialPage: number = 0, initialSize: number = 12) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [data, setData] = useState<PageResponseBorrowedBookResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    BookService.findAllBorrowedBooks(page, size)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, size]);

  return { data, loading, error, page, setPage, size, setSize };
}
