import { Alert, Button, Card, CardContent, CardMedia, CircularProgress, Container, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PaginationControls from '../components/PaginationControls';
import { useMyBooks } from '../hooks/useMyBooks';

const MyBooksPage: React.FC = () => {
  const { data, loading, error, page, setPage, size, setSize } = useMyBooks();
  const books = data?.content || [];
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Books</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error.message || String(error)}</Alert>}
      
      {books.length === 0 && !loading && (
        <Typography variant="body1" color="text.secondary">
          You haven't uploaded any books yet.
        </Typography>
      )}

      <div className="book-list-grid">
        {books.map(book => (
          <div className="book-list-card" key={book.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', width: '100%', maxWidth: 280 }} onClick={() => navigate(`/books/${book.id}`)}>
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
                <Button 
                  variant="outlined" 
                  size="small" 
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/books/${book.id}`);
                  }}
                >
                  View Details
                </Button>
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

export default MyBooksPage; 