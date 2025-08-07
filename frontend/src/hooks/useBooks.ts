import { useEffect, useState } from 'react';
import type { PageResponseBookResponse } from '../app/services/models/PageResponseBookResponse';
import { BookService } from '../app/services/services/BookService';

export function useBooks(initialPage: number = 0, initialSize: number = 12) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [data, setData] = useState<PageResponseBookResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    BookService.findAllBooks(page, size)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, size]);

  return { data, loading, error, page, setPage, size, setSize };
} 