import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // Importa o hook de autenticação

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Obtém a função de login do contexto de autenticação

  // Lida com o envio do formulário de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setMessage('Entrando...');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Chama a função de login do contexto para armazenar o token e dados do usuário
        login(data.token, data.user);
        setMessage('Login realizado com sucesso!');
        // Redireciona para o painel do criador após o login
        navigate('/painel-criador'); // Caminho atualizado
      } else {
        const errorData = await response.json();
        setError(`Erro ao fazer login: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao fazer login:', err);
      setError('Erro de conexão ao tentar fazer login. Tente novamente mais tarde.');
    }
  };

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />

        <h1>ESPAÇO DO CRIADOR</h1>
        <p>Seja bem-vindo</p>

        <section className="form-box-criador">
          <h2>LOGIN</h2>
          <form onSubmit={handleLoginSubmit}>
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

            <label>
              Senha:<br />
              <input
                type="password"
                name="senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit">ENTRAR</button>

            {/* Link para a página de recuperação de senha (será criada) */}
            <Link to="/recuperar-senha" className="recuperar">
              Esqueceu a senha?
            </Link>
          </form>
          {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'green' }}>{message}</p>}
          {error && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'red' }}>{error}</p>}


          <div className="registrar">
            <p>Ainda não tem uma senha?</p>
            {/* Link para a página de registro */}
            <Link to="/registrar" className="botao-registro">
              REGISTRE-SE
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Login;
