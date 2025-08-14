# Google Books API Integration

This application now integrates with the Google Books API to provide real book data and enhance the user experience.

## Features

### 1. Real Book Data
- **Trending Books**: Shows recently published fiction books from the current year
- **Popular Books**: Displays popular fiction books from Google Books
- **Bestsellers**: Features current bestseller fiction books
- **Book Covers**: High-quality book cover images from Google Books
- **Author Information**: Real author names and book details

### 2. Ratings & Reviews
- **Google Ratings**: Shows existing ratings from Google Books users
- **Review System**: Users can rate and review books (currently simulated)
- **Star Display**: Visual star ratings (1-5 stars) with half-star support
- **Rating Counts**: Shows how many people have rated each book

### 3. Book Information
- **Title & Author**: Complete book information
- **ISBN**: International Standard Book Numbers when available
- **Synopsis**: Book descriptions from Google Books
- **Publication Date**: When the book was published
- **Page Count**: Number of pages in the book
- **Categories**: Book genres and categories

## Components

### GoogleBooksService
- Handles API calls to Google Books
- Converts Google Books data to our application format
- Provides search, trending, and popular book functions

### GoogleBookCard
- Displays individual books with ratings
- Shows book covers, titles, authors, and ratings
- Includes review buttons for user interaction

### GoogleBookReviewModal
- Modal for rating and reviewing books
- Interactive star rating system
- Review text input with validation
- Matches the existing UI design

### useGoogleBooks Hook
- React hook for fetching Google Books data
- Provides loading states and error handling
- Supports different book categories (trending, popular, bestsellers)

## Usage

The Google Books integration is automatically active on the home page:

1. **Trending Today**: Shows recent fiction books
2. **Popular Books**: Displays popular fiction books
3. **Discover Books**: Features current bestsellers

Users can:
- Click on book cards to see details
- Rate books with 1-5 stars
- Write reviews for books
- View existing ratings from Google Books

## Technical Details

### API Endpoints Used
- `https://www.googleapis.com/books/v1/volumes` - Search and retrieve books
- No API key required for basic usage (limited to 1,000 requests per day)

### Data Conversion
Google Books data is converted to match our existing book format:
```typescript
{
  id: string;
  title: string;
  authorName: string;
  isbn: string;
  synopsis: string;
  cover: string | null;
  averageRating: number;
  ratingsCount: number;
  isGoogleBook: boolean;
  googleBookId: string;
}
```

### Error Handling
- Network errors are caught and displayed to users
- Loading states show while fetching data
- Fallback displays when no books are available

## Future Enhancements

1. **Backend Integration**: Save user reviews to our database
2. **Search Functionality**: Add search by title, author, or genre
3. **Book Details Page**: Dedicated page for Google Books
4. **Reading Lists**: Add Google Books to user's reading lists
5. **Recommendations**: Suggest books based on user preferences

## Notes

- Google Books API has rate limits (1,000 requests per day without API key)
- Some books may not have covers or complete information
- Reviews are currently simulated (not saved to backend)
- The integration uses direct fetch calls to avoid CORS issues
