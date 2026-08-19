import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { CreateProfilePage } from './pages/CreateProfilePage';
import { InvitePage } from './pages/InvitePage';
import { ResultPage } from './pages/ResultPage';
import { DemoPage } from './pages/DemoPage';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateProfilePage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/dashboard" element={<ResultPage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
