import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function ForcePasswordChange() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // CORREÇÃO AQUI: Removido 'logout' porque não é usado neste componente.
  const { isAuthenticated, user, login } = useAuth(); // Importa login para atualizar isFirstLogin localmente

  // Redireciona se não estiver autenticado ou se já trocou a senha
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/espaco-criador'); // Redireciona para o login se não autenticado
    } else if (user && !user.isFirstLogin) {
      navigate('/painel-criador'); // Se já trocou, vai para o painel
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setMessage('Trocando senha...');

    try {
      const response = await fetch('https://fio-alma-main.onrender.com/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Envia o token para autenticar
        },
        body: JSON.stringify({ newPassword }), // Não precisa da senha atual se for primeiro login
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Sua senha foi alterada com sucesso! Redirecionando para o painel.');
        // Atualiza o estado no contexto para refletir isFirstLogin = false
        login(localStorage.getItem('token'), { ...user, isFirstLogin: data.isFirstLogin });
        setTimeout(() => navigate('/painel-criador'), 2000);
      } else {
        const errorData = await response.json();
        setError(`Erro ao trocar senha: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao trocar senha:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  // Se não está autenticado ou não precisa trocar a senha, não renderiza o formulário
  if (!isAuthenticated || (user && !user.isFirstLogin)) {
    return null; // Ou um loader, ou redirecionamento imediato via useEffect
  }

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />

        <h1>TROCAR SENHA</h1>
        <p>Esta é a primeira vez que você acessa. Por favor, defina uma nova senha.</p>

        <section className="form-box-criador">
          <h2>DEFINIR NOVA SENHA</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Nova Senha:<br />
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <label>
              Confirmar Nova Senha:<br />
              <input
                type="password"
                name="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit">TROCAR SENHA</button>
          </form>
          {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'green' }}>{message}</p>}
          {error && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'red' }}>{error}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default ForcePasswordChange;
