import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Alert, Card, CardContent, CardMedia, CircularProgress, Container, Typography } from '@mui/material';
import React from 'react';
import PaginationControls from '../components/PaginationControls';
import { useReadBooks } from '../hooks/useReadBooks';

// Note: This page shows books the user has completed reading
// UI shows as "Read" tab but internally still called "ReadPage"

const ReadPage: React.FC = () => {
  const { data, loading, error, page, setPage, size, setSize } = useReadBooks();
  const books = data?.content || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Read Books</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error.message || String(error)}</Alert>}
      
      {books.length === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't read any books yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Borrow some books and mark them as read when you finish!
          </Typography>
        </div>
      )}

      <div className="book-list-grid">
        {books.map(book => (
          <div className="book-list-card" key={book.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              width: '100%',
              maxWidth: 280,
              border: '2px solid #4caf50'
            }}>
              {book.cover ? (
                <CardMedia
                  component="img"
                  height="120"
                  image={`data:image/jpeg;base64,${book.cover}`}
                  alt={book.title}
                  sx={{ objectFit: 'contain' }}
                />
              ) : (
                <CardMedia
                  component="div"
                  sx={{ height: 120, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No Cover
                  </Typography>
                </CardMedia>
              )}
              <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', mb: 0.5, lineHeight: 1.2 }}>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  by {book.authorName}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                  ✓ {book.readCount && book.readCount > 1 ? `Read ${book.readCount}x` : 'Completed'}
                </Typography>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      {data && (
        <PaginationControls
          currentPage={page}
          totalPages={data.totalPages || 0}
          pageSize={size}
          totalElements={data.totalElements || 0}
          onPageChange={setPage}
          onPageSizeChange={setSize}
          loading={loading}
        />
      )}
    </Container>
  );
};

export default ReadPage; 