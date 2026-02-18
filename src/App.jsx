import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Agenda } from './pages/Agenda';
import { Services } from './pages/Services';
import { Configuracion } from './pages/Configuracion';

function App() {
  return (
    <AuthGuard>
      <Layout>
        <Routes>
          <Route path="/" element={<Agenda />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/services" element={<Services />} />
          <Route path="/config" element={<Configuracion />} />
          <Route path="*" element={<Agenda />} />
        </Routes>
      </Layout>
    </AuthGuard>
  );
}

export default App;
