import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // Para obter/atualizar o usuário

function EditProfile() {
  // Removido 'logout' daqui para resolver o aviso 'never used'
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: user ? user.email : '', // Pré-preenche com o email atual
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redireciona se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/espaco-criador');
    }
  }, [isAuthenticated, navigate]);

  // Atualiza o formulário se o usuário for carregado após o render inicial
  useEffect(() => {
    if (user && formData.email === '') { // Apenas se o email ainda não estiver preenchido
      setFormData({ email: user.email });
    }
  }, [user, formData.email]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.message);
        // Atualiza o contexto de autenticação com o novo token e dados do usuário
        // O método 'login' do AuthContext é usado para isso
        login(data.token, data.user); // Atualiza o estado global do usuário
        setTimeout(() => navigate('/painel-criador'), 1500); // Volta para o painel do criador
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Erro ao atualizar perfil.');
      }
    } catch (err) {
      console.error('Erro de conexão ao atualizar perfil:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // ou um spinner, ou redirecionamento já feito no useEffect
  }

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />
        <h1>EDITAR PERFIL</h1>
        <p>Atualize suas informações de perfil.</p>

        <section className="form-box-criador">
          <h2>Seu Perfil</h2>
          <form onSubmit={handleSubmit} className="edit-profile-form">
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
            {/* Adicione outros campos aqui conforme seu modelo User.js */}
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button type="button" onClick={() => navigate('/painel-criador')} className="btn-secondary">Cancelar</button>
            </div>
          </form>
          {message && <p style={{ textAlign: 'center', color: 'green', marginTop: '1rem' }}>{message}</p>}
          {error && <p style={{ textAlign: 'center', color: 'red', marginTop: '1rem' }}>{error}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default EditProfile;
