import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import NewsFeed from './pages/NewsFeed';
import ListCourse from './pages/ListCourse';
import ToolPage from './pages/ToolPage';
import ComparePage from './pages/ComparePage';

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-ink-950">
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/news" element={<NewsFeed />} />
        <Route path="/list-course" element={<ListCourse />} />
        <Route path="/tool/:slug" element={<ToolPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/compare/:slug" element={<ComparePage />} />
      </Routes>
    </div>
  );
}
