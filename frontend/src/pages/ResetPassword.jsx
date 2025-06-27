import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function ResetPassword() {
  const { token } = useParams(); // Pega o token da URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setMessage('Redefinindo senha...');

    try {
      const response = await fetch(`https://fio-alma-main.onrender.com/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        setMessage('Sua senha foi redefinida com sucesso! Você pode fazer login agora.');
        setTimeout(() => navigate('/espaco-criador'), 3000); // Redireciona para o login
      } else {
        const errorData = await response.json();
        setError(`Erro ao redefinir senha: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão:', err);
      setError('Erro de conexão ao tentar redefinir a senha. Tente novamente mais tarde.');
    }
  };

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />

        <h1>REDEFINIR SENHA</h1>
        <p>Informe sua nova senha</p>

        <section className="form-box-criador">
          <h2>NOVA SENHA</h2>
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
            <button type="submit">REDEFINIR</button>
          </form>
          {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'green' }}>{message}</p>}
          {error && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'red' }}>{error}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default ResetPassword;
