import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
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
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />
        
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        
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
