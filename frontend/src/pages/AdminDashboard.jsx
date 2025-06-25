import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      navigate('/espaco-criador');
    }
  }, [isAuthenticated, user, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const applicationsRes = await fetch('http://localhost:5000/api/creator-applications', {
        headers: { 'x-auth-token': token }
      });
      if (!applicationsRes.ok) throw new Error('Falha ao buscar aplicações.');
      const applicationsData = await applicationsRes.json();
      setApplications(applicationsData);

      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'x-auth-token': token }
      });
      if (!usersRes.ok) throw new Error('Falha ao buscar usuários.');
      const usersData = await usersRes.json();
      setUsers(usersData);

      const productsRes = await fetch('http://localhost:5000/api/products', {
        headers: { 'x-auth-token': token }
      });
      if (!productsRes.ok) throw new Error('Falha ao buscar produtos.');
      const productsData = await productsRes.json();
      const productsWithFullImageUrls = productsData.map(p => ({
        ...p,
        imagens: p.imagens.map(img => `http://localhost:5000${img}`)
      }));
      setProducts(productsWithFullImageUrls);

    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [isAuthenticated, user]);

  const handleApproveCreator = async (applicationEmail) => {
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/admin/approve-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ email: applicationEmail })
      });

      if (res.ok) {
        setMessage('Criador aprovado e e-mail enviado com sucesso!');
        fetchAdminData();
      } else {
        const errorData = await res.json();
        setError(`Erro ao aprovar criador: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao aprovar criador:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  const handleRejectCreator = async (applicationEmail) => {
    setMessage('');
    setError('');
    const reason = prompt('Por favor, insira o motivo da rejeição (opcional):');
    if (reason === null) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/admin/reject-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ email: applicationEmail, reason })
      });

      if (res.ok) {
        setMessage('Criador rejeitado e e-mail enviado com sucesso!');
        fetchAdminData();
      } else {
        const errorData = await res.json();
        setError(`Erro ao rejeitar criador: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao rejeitar criador:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  // NOVO: Função para deletar usuário
  const handleDeleteUser = async (userId, userEmail) => {
    setMessage('');
    setError('');

    // Confirmação para evitar exclusões acidentais
    if (window.confirm(`Tem certeza que deseja deletar o usuário ${userEmail}? Esta ação é irreversível e também removerá a aplicação de criador associada.`)) {
      if (user && user.id === userId) {
        setError('Você não pode deletar sua própria conta de administrador.');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/auth/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': token
          }
        });

        if (res.ok) {
          setMessage(`Usuário ${userEmail} deletado com sucesso.`);
          fetchAdminData(); // Recarrega todos os dados
        } else {
          const errorData = await res.json();
          setError(`Erro ao deletar usuário: ${errorData.message || res.statusText}`);
        }
      } catch (err) {
        console.error('Erro de conexão ao deletar usuário:', err);
        setError('Erro de conexão. Tente novamente mais tarde.');
      }
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/espaco-criador');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container-criador" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Carregando Painel Administrativo...</h2>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />
        <h1>PAINEL ADMINISTRATIVO</h1>
        <p>Bem-vindo, {user.email} (Administrador)!</p>
        <button onClick={handleLogout} className="button-logout">Sair</button>

        {message && <p style={{ textAlign: 'center', color: 'green', marginTop: '1rem' }}>{message}</p>}
        {error && <p style={{ textAlign: 'center', color: 'red', marginTop: '1rem' }}>{error}</p>}

        <section className="admin-section form-box-criador" style={{ marginTop: '2rem' }}>
          <h2>Aplicações de Criadores</h2>
          {applications.length === 0 ? (
            <p>Nenhuma aplicação de criador encontrada.</p>
          ) : (
            <div className="admin-list-container">
              {applications.map((app) => {
                const relatedUser = users.find(u => u.email === app.email);
                const isUserApproved = relatedUser ? relatedUser.approved : false;

                return (
                  <div key={app._id} className="admin-list-item">
                    <p><strong>Nome:</strong> {app.nome}</p>
                    <p><strong>E-mail:</strong> {app.email}</p>
                    <p><strong>Telefone:</strong> {app.telefone}</p>
                    <p><strong>Mensagem:</strong> {app.mensagem}</p>
                    {app.imagemUrl && (
                      <p><strong>Imagem da Aplicação:</strong> <a href={`http://localhost:5000${app.imagemUrl}`} target="_blank" rel="noopener noreferrer">Ver Imagem</a></p>
                    )}
                    <p>
                      <strong>Status da Aplicação:</strong> {' '}
                      <span style={{
                        fontWeight: 'bold',
                        color: app.status === 'aprovado' ? 'green' :
                               app.status === 'rejeitado' ? 'red' : 'orange'
                      }}>
                        {app.status.toUpperCase()}
                      </span>
                    </p>
                    <p>
                      <strong>Status da Conta do Usuário:</strong> {' '}
                      <span style={{
                        fontWeight: 'bold',
                        color: isUserApproved ? 'green' : 'red'
                      }}>
                        {isUserApproved ? 'APROVADO' : 'NÃO APROVADO'}
                      </span>
                    </p>
                    {app.status === 'pendente' && !isUserApproved && (
                      <div className="admin-actions">
                        <button onClick={() => handleApproveCreator(app.email)} className="btn-success">Aprovar</button>
                        <button onClick={() => handleRejectCreator(app.email)} className="btn-danger">Rejeitar</button>
                      </div>
                    )}
                    {(app.status !== 'pendente' || isUserApproved) && (
                        <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#555' }}>
                            {app.status !== 'pendente' ? `Esta aplicação já foi ${app.status}.` : 'Usuário já aprovado.'}
                        </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Seção de Todos os Usuários Registrados (Criadores e Admins) */}
        <section className="admin-section form-box-criador" style={{ marginTop: '2rem' }}>
          <h2>Todos os Usuários Registrados</h2>
          {users.length === 0 ? (
            <p>Nenhum usuário registrado.</p>
          ) : (
            <div className="admin-list-container">
              {users.map((userItem) => (
                <div key={userItem._id} className="admin-list-item">
                  <p><strong>E-mail:</strong> {userItem.email}</p>
                  <p><strong>Função:</strong> {userItem.role}</p>
                  <p>
                    <strong>Aprovado:</strong> {' '}
                    <span style={{ fontWeight: 'bold', color: userItem.approved ? 'green' : 'red' }}>
                      {userItem.approved ? 'Sim' : 'Não'}
                    </span>
                  </p>
                  <p><strong>Primeiro Login:</strong> {userItem.isFirstLogin ? 'Sim' : 'Não'}</p>
                  <div className="admin-actions">
                    {/* Botão para deletar usuário (apenas se não for o admin logado) */}
                    {userItem._id !== user.id && ( // Não permite que o admin delete a si mesmo
                      <button 
                        onClick={() => handleDeleteUser(userItem._id, userItem.email)} 
                        className="btn-danger">
                        Deletar Usuário
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção de Todos os Produtos Cadastrados */}
        <section className="admin-section form-box-criador" style={{ marginTop: '2rem' }}>
          <h2>Todos os Produtos Cadastrados</h2>
          {products.length === 0 ? (
            <p>Nenhum produto cadastrado.</p>
          ) : (
            <div className="admin-list-container">
              {products.map((product) => (
                <div key={product._id} className="admin-list-item">
                  <p><strong>Título:</strong> {product.titulo}</p>
                  <p><strong>Criador:</strong> {product.criador}</p>
                  <p><strong>Descrição:</strong> {product.descricao.substring(0, 100)}...</p>
                  {product.imagens && product.imagens.length > 0 && (
                    <p><strong>Imagem Principal:</strong> <a href={product.imagens[0]} target="_blank" rel="noopener noreferrer">Ver Imagem</a></p>
                  )}
                  <div className="admin-actions">
                    <Link to={`/editar-produto/${product._id}`} className="btn-edit">Editar</Link>
                    <button onClick={() => {
                        if (window.confirm('Tem certeza que deseja deletar este produto como Admin?')) {
                          const token = localStorage.getItem('token');
                          fetch(`http://localhost:5000/api/products/${product._id}`, {
                              method: 'DELETE',
                              headers: { 'x-auth-token': token }
                          })
                          .then(res => res.json())
                          .then(data => {
                              setMessage(data.message || 'Produto deletado com sucesso (Admin)!');
                              fetchAdminData();
                          })
                          .catch(err => {
                              setError('Erro ao deletar produto (Admin): ' + err.message);
                          });
                        }
                    }} className="btn-danger">Deletar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default AdminDashboard;
