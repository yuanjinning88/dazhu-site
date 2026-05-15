import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import CustomCursor from '@/components/cursor/CustomCursor';
import useLenis from '@/hooks/useLenis';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import EssayListPage from '@/pages/EssayListPage';
import MusicPage from '@/pages/MusicPage';
import MoviesPage from '@/pages/MoviesPage';
import MusicDetailPage from '@/pages/MusicDetailPage';
import MovieDetailPage from '@/pages/MovieDetailPage';
import NotesListPage from '@/pages/NotesListPage';
import NotesPostPage from '@/pages/NotesPostPage';
import PhotosPage from '@/pages/PhotosPage';
import LoginPage from '@/pages/LoginPage';

const EssayPostPage = lazy(() => import('@/pages/EssayPostPage'));
const EssayEditPage = lazy(() => import('@/pages/EssayEditPage'));
const NotesEditPage = lazy(() => import('@/pages/NotesEditPage'));

const PageLoader = () => (
  <div className="min-h-screen pt-24 flex items-center justify-center">
    <p className="text-text-muted">加载中...</p>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  useLenis();

  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/essays" element={<EssayListPage />} />
        <Route path="/essays/:slug/edit" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <EssayEditPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/essays/:slug" element={
          <Suspense fallback={<PageLoader />}>
            <EssayPostPage />
          </Suspense>
        } />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/music/:id" element={<MusicDetailPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/notes" element={<NotesListPage />} />
        <Route path="/notes/:id/edit" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <NotesEditPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/notes/:id" element={<NotesPostPage />} />
        <Route path="/photos" element={<PhotosPage />} />
      </Routes>
      <Footer />
    </>
  );
}
