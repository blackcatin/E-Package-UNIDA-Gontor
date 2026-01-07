import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPaket } from './pages/DashboardPaket';
import { InputCRUDPaket } from './pages/InputCRUDPaket'; 
import { DataPaket } from './pages/DataPaket';
import { SearchPacket } from './pages/SearchPacket';
import { MasterKodeKategori } from './pages/MasterKodeKategori';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard" element={<DashboardPaket />} />
        <Route path="/dashboard/input" element={<InputCRUDPaket />} />
        <Route path="/dashboard/input/:id" element={<InputCRUDPaket />} />
        <Route path="/dashboard/data" element={<DataPaket />} />
        <Route path="/dashboard/search" element={<SearchPacket />} />
        <Route
          path="/dashboard/master-kode-kategori"
          element={<MasterKodeKategori />}
        />
      </Routes>
    </Router>
  );
}