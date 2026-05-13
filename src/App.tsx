import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/layout/ScrollProgress';
import SideMenu from '@/components/layout/SideMenu';
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

const EssayPostPage = lazy(() => import('@/pages/EssayPostPage'));

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <SideMenu />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/essays" element={<EssayListPage />} />
        <Route path="/essays/:slug" element={
          <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center text-text-muted">加载中...</div>}>
            <EssayPostPage />
          </Suspense>
        } />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/music/:id" element={<MusicDetailPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/notes" element={<NotesListPage />} />
        <Route path="/notes/:id" element={<NotesPostPage />} />
        <Route path="/photos" element={<PhotosPage />} />
      </Routes>
      <Footer />
    </>
  );
}
