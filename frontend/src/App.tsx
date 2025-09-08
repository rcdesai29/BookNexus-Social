import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationDisplay from './components/NotificationDisplay';
import { initializeWebSocket } from './services/WebSocketService';
import ActivateAccountPage from './pages/ActivateAccountPage';

import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import BookListPage from './pages/BookListPage';
import BorrowedBooksPage from './pages/BorrowedBooksPage';
import LoginPage from './pages/LoginPage';
import MyBooksPage from './pages/MyBooksPage';
import ReadPage from './pages/ReadPage';
import RegisterPage from './pages/RegisterPage';
import TBRPage from './pages/TBRPage';
import CurrentlyReadingPage from './pages/CurrentlyReadingPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SearchPage from './pages/SearchPage';
import DisplayNameSetupPage from './pages/DisplayNameSetupPage';
import FindFriendsPage from './pages/FindFriendsPage';
import BookDetailsPage from './pages/BookDetailsPage';

function App() {
  useEffect(() => {
    // Initialize WebSocket connection when app starts
    initializeWebSocket();
  }, []);

  return (
    <BrowserRouter>
      <CssBaseline />
      <Navbar />
      <NotificationDisplay />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />
        <Route path="/setup-display-name" element={<DisplayNameSetupPage />} />
        
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/find-friends" element={<FindFriendsPage />} />
        <Route path="/book/:googleBookId" element={<BookDetailsPage />} />
        
        {/* Protected routes */}
        <Route path="/books" element={
          <ProtectedRoute>
            <BookListPage />
          </ProtectedRoute>
        } />
        <Route path="/books/:id" element={
          <ProtectedRoute>
            <BookDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/my-books" element={
          <ProtectedRoute>
            <MyBooksPage />
          </ProtectedRoute>
        } />
        <Route path="/borrowed-books" element={
          <ProtectedRoute>
            <BorrowedBooksPage />
          </ProtectedRoute>
        } />
        <Route path="/currently-reading" element={
          <ProtectedRoute>
            <CurrentlyReadingPage />
          </ProtectedRoute>
        } />
        <Route path="/tbr" element={<ProtectedRoute><TBRPage /></ProtectedRoute>} />
        <Route path="/read" element={<ProtectedRoute><ReadPage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/profile/:userId/edit" element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
