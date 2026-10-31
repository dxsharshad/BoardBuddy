import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectPage from './pages/SubjectPage';
import ChapterPage from './pages/ChapterPage';
import Practice from './pages/Practice';
import Quiz from './pages/Quiz';
import Flashcards from './pages/Flashcards';
import Planner from './pages/Planner';
import Progress from './pages/Progress';
import Doubt from './pages/Doubt';
import Pyq from './pages/Pyq';
import Search from './pages/Search';
import Bookmarks from './pages/Bookmarks';
import More from './pages/More';
import Settings from './pages/Settings';
import Formulas from './pages/Formulas';
import Account from './pages/Account';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="subject/:id" element={<SubjectPage />} />
        <Route path="chapter/:id" element={<ChapterPage />} />
        <Route path="practice" element={<Practice />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="planner" element={<Planner />} />
        <Route path="progress" element={<Progress />} />
        <Route path="doubt" element={<Doubt />} />
        <Route path="pyq" element={<Pyq />} />
        <Route path="search" element={<Search />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="formulas" element={<Formulas />} />
        <Route path="more" element={<More />} />
        <Route path="settings" element={<Settings />} />
        <Route path="account" element={<Account />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
