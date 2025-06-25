import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setMessage('Registrando...');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (response.ok) {
        // CORREÇÃO AQUI: Não precisamos mais da variável 'data' se não for usada.
        // const data = await response.json();
        setMessage('Registro realizado com sucesso! Aguarde a aprovação da equipe para acessar o Espaço do Criador.');
        setTimeout(() => navigate('/aguardando-aprovacao'), 3000);
      } else {
        const errorData = await response.json();
        setError(`Erro ao registrar: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao registrar:', err);
      setError('Erro de conexão ao tentar registrar. Tente novamente mais tarde.');
    }
  };

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />

        <h1>REGISTRO DE CRIADOR</h1>
        <p>Preencha os dados para se registrar</p>

        <section className="form-box-criador">
          <h2>CRIAR CONTA</h2>
          <form onSubmit={handleSubmit}>
            <label>
              E-mail:<br />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Senha:<br />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Confirmar Senha:<br />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit">REGISTRAR</button>
          </form>
          {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'green' }}>{message}</p>}
          {error && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'red' }}>{error}</p>}

          <div className="registrar">
            <p>Já tem uma conta?</p>
            <Link to="/espaco-criador" className="botao-registro">
              LOGIN
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Register;
