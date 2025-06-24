import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setMessage('Enviando solicitação...');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Se o e-mail estiver registrado, um link para redefinição de senha será enviado para sua caixa de entrada.');
      } else {
        const errorData = await response.json();
        setError(`Erro ao solicitar recuperação: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão:', err);
      setError('Erro de conexão ao tentar recuperar a senha. Tente novamente mais tarde.');
    }
  };

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />

        <h1>RECUPERAR SENHA</h1>
        <p>Informe seu e-mail para redefinir sua senha</p>

        <section className="form-box-criador">
          <h2>ESQUECI MINHA SENHA</h2>
          <form onSubmit={handleSubmit}>
            <label>
              E-mail:<br />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit">ENVIAR</button>
          </form>
          {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'green' }}>{message}</p>}
          {error && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'red' }}>{error}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default ForgotPassword;
