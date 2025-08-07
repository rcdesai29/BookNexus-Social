import { Alert, Box, Button, Checkbox, Container, FormControlLabel, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BookService } from '../app/services/services/BookService';

const AddBookPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isbn, setIsbn] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [shareable, setShareable] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const bookId = await BookService.saveBook({ title, authorName, isbn, synopsis, shareable });
      if (cover && bookId) {
        const formData = new FormData();
        formData.append('file', cover);
        await BookService.uploadBookCoverPicture(bookId, { file: cover });
      }
      setSuccess(true);
      setTitle(''); setAuthorName(''); setIsbn(''); setSynopsis(''); setShareable(false); setCover(null);
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Add to Library</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Book added successfully!</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Author Name" value={authorName} onChange={e => setAuthorName(e.target.value)} fullWidth margin="normal" required />
        <TextField label="ISBN" value={isbn} onChange={e => setIsbn(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Synopsis" value={synopsis} onChange={e => setSynopsis(e.target.value)} fullWidth margin="normal" multiline rows={3} required inputProps={{ maxLength: 255 }} />
        <Typography variant="caption" color={synopsis.length > 255 ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
          {synopsis.length}/255 characters
        </Typography>
        <FormControlLabel control={<Checkbox checked={shareable} onChange={e => setShareable(e.target.checked)} />} label="Shareable" />
        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Upload Cover
          <input type="file" hidden accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} />
        </Button>
        {cover && <Typography variant="body2" sx={{ mt: 1 }}>{cover.name}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading || synopsis.length > 255} sx={{ mt: 3 }}>
          {loading ? 'Adding...' : 'Add Book'}
        </Button>
      </Box>
    </Container>
  );
};

export default AddBookPage; 