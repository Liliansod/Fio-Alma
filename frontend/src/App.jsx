import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Vitrine from './pages/Vitrine.jsx';
import Participate from './pages/Participate.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Detail from './pages/Detail.jsx';
import CreatorDashboard from './pages/CreatorDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ForcePasswordChange from './pages/ForcePasswordChange.jsx'; // Nova Importação
import { Link } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vitrine" element={<Vitrine />} />
        <Route path="/facaparte" element={<Participate />} />
        <Route path="/espaco-criador" element={<Login />} />
        <Route path="/registrar" element={<Register />} />
        <Route path="/detalhe/:id" element={<Detail />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/redefinir-senha/:token" element={<ResetPassword />} />
        {/* NOVA ROTA para troca de senha obrigatória */}
        <Route path="/trocar-senha-primeiro-acesso" element={<ForcePasswordChange />} />

        {/* Rota protegida para o Painel do Criador */}
        <Route
          path="/painel-criador"
          element={
            <ProtectedRoute>
              <CreatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/aguardando-aprovacao" element={
          <main className="container-criador" style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Aguardando Aprovação</h2>
            <p>Sua conta foi registrada e está aguardando aprovação da nossa equipe. Você será notificado por e-mail quando sua conta for aprovada.</p>
            <Link to="/espaco-criador" className="botao-registro" style={{marginTop: '1rem'}}>Voltar para o Login</Link>
          </main>
        } />
      </Routes>
    </Router>
  );
}

export default App;
