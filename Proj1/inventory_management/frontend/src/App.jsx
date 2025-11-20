import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeModeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Warehouses from './pages/Warehouses';
import InventoryItems from './pages/InventoryItems';
import './App.css';

function App() {
  return (
    <ThemeModeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/inventory" element={<InventoryItems />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeModeProvider>
  );
}

export default App;
