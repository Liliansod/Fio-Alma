import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Componente Modal simples para confirmações e entradas de dados
const Modal = ({ show, title, message, onConfirm, onCancel, children, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        {children} {/* Para input de texto ou conteúdo adicional */}
        <div className="modal-actions">
          <button onClick={onConfirm} className="btn-success">{confirmText}</button>
          <button onClick={onCancel} className="btn-secondary">{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Estados para o modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve', 'reject', 'deleteUser', 'deleteProduct'
  const [modalData, setModalData] = useState({}); // Dados para a ação do modal
  const [rejectReason, setRejectReason] = useState(''); // Estado para o motivo da rejeição

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      navigate('/espaco-criador');
    }
  }, [isAuthenticated, user, navigate]);

  // Função para buscar todos os dados do admin
  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      // Busca aplicações de criadores
      const applicationsRes = await fetch('http://localhost:5000/api/admin/applications', { // Rota em adminRoutes.js
        headers: { 'x-auth-token': token }
      });
      if (!applicationsRes.ok) throw new Error('Falha ao buscar aplicações.');
      const applicationsData = await applicationsRes.json();
      setApplications(applicationsData);

      // Busca usuários
      const usersRes = await fetch('http://localhost:5000/api/admin/users', { // Rota em adminRoutes.js
        headers: { 'x-auth-token': token }
      });
      if (!usersRes.ok) throw new Error('Falha ao buscar usuários.');
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Busca produtos
      const productsRes = await fetch('http://localhost:5000/api/products', { // Rota em productRoutes.js (pública)
        headers: { 'x-auth-token': token } // Pode exigir token se a rota foi protegida
      });
      if (!productsRes.ok) throw new Error('Falha ao buscar produtos.');
      const productsData = await productsRes.json();
      const productsWithFullImageUrls = productsData.map(p => ({
        ...p,
        // Garante que o caminho da imagem esteja correto (sem http://localhost:5000/uploads duplicado)
        imagens: p.imagens.map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`)
      }));
      setProducts(productsWithFullImageUrls);

    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar dados quando o componente é montado ou usuário/autenticação mudam
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [isAuthenticated, user]);

  // Funções de ação que serão chamadas pelo modal
  const handleApproveCreatorAction = async (applicationEmail) => {
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/admin/approve-creator', { // Rota em authRoutes.js
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ email: applicationEmail }) // Envia apenas o email para a rota
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || 'Criador aprovado e e-mail enviado com sucesso!');
        fetchAdminData(); // Recarrega os dados para atualizar o status
      } else {
        const errorData = await res.json();
        setError(`Erro ao aprovar criador: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao aprovar criador:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    } finally {
      setShowModal(false); // Fecha o modal após a ação
    }
  };

  const handleRejectCreatorAction = async (applicationEmail, reason) => {
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/admin/reject-creator', { // Rota em authRoutes.js
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ email: applicationEmail, reason })
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || 'Criador rejeitado e e-mail enviado com sucesso!');
        fetchAdminData(); // Recarrega os dados para atualizar o status
      } else {
        const errorData = await res.json();
        setError(`Erro ao rejeitar criador: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao rejeitar criador:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    } finally {
      setShowModal(false); // Fecha o modal após a ação
      setRejectReason(''); // Limpa o campo de motivo
    }
  };

  const handleDeleteUserAction = async (userId, userEmail) => {
    setMessage('');
    setError('');

    if (user && user.id === userId) {
      setError('Você não pode deletar sua própria conta de administrador.');
      setShowModal(false); // Fecha o modal
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/auth/admin/users/${userId}`, { // Rota em authRoutes.js
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
    } finally {
      setShowModal(false); // Fecha o modal
    }
  };

  const handleDeleteProductAction = async (productId) => {
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, { // Rota em productRoutes.js
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || 'Produto deletado com sucesso (Admin)!');
        fetchAdminData(); // Recarrega dados
      } else {
        const errorData = await res.json();
        setError('Erro ao deletar produto (Admin): ' + (errorData.message || res.statusText));
      }
    } catch (err) {
      console.error('Erro ao deletar produto (Admin):', err);
      setError('Erro de conexão ao deletar produto. Tente novamente mais tarde.');
    } finally {
      setShowModal(false); // Fecha o modal
    }
  };

  // Funções para abrir os modais
  const openApproveModal = (email) => {
    setModalType('approve');
    setModalData({ email });
    setShowModal(true);
  };

  const openRejectModal = (email) => {
    setModalType('reject');
    setModalData({ email });
    setRejectReason(''); // Limpa o motivo anterior
    setShowModal(true);
  };

  const openDeleteUserModal = (userId, userEmail) => {
    setModalType('deleteUser');
    setModalData({ userId, userEmail });
    setShowModal(true);
  };

  const openDeleteProductModal = (productId, productTitle) => {
    setModalType('deleteProduct');
    setModalData({ productId, productTitle });
    setShowModal(true);
  };

  // Lógica de logout
  const handleLogout = () => {
    logout();
    navigate('/espaco-criador');
  };

  // Renderização condicional enquanto carrega ou se não for admin
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
    return null; // O redirecionamento já é feito no useEffect
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

        {/* Modal Dinâmico */}
        <Modal
          show={showModal}
          title={
            modalType === 'approve' ? 'Confirmar Aprovação' :
            modalType === 'reject' ? 'Rejeitar Aplicação' :
            modalType === 'deleteUser' ? 'Confirmar Exclusão de Usuário' :
            modalType === 'deleteProduct' ? 'Confirmar Exclusão de Produto' : ''
          }
          message={
            modalType === 'approve' ? `Tem certeza que deseja aprovar a aplicação de criador para ${modalData.email}?` :
            modalType === 'reject' ? `Tem certeza que deseja rejeitar a aplicação de criador para ${modalData.email}?` :
            modalType === 'deleteUser' ? `Tem certeza que deseja deletar o usuário ${modalData.userEmail}? Esta ação é irreversível e também removerá a aplicação de criador associada.` :
            modalType === 'deleteProduct' ? `Tem certeza que deseja deletar o produto "${modalData.productTitle}"?` : ''
          }
          onConfirm={() => {
            if (modalType === 'approve') handleApproveCreatorAction(modalData.email);
            else if (modalType === 'reject') handleRejectCreatorAction(modalData.email, rejectReason);
            else if (modalType === 'deleteUser') handleDeleteUserAction(modalData.userId, modalData.userEmail);
            else if (modalType === 'deleteProduct') handleDeleteProductAction(modalData.productId);
          }}
          onCancel={() => setShowModal(false)}
          confirmText={modalType === 'reject' ? 'Rejeitar' : 'Confirmar'}
          cancelText="Cancelar"
        >
          {modalType === 'reject' && (
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="reject-reason">Motivo da Rejeição (opcional):</label><br />
              <textarea
                id="reject-reason"
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              ></textarea>
            </div>
          )}
        </Modal>

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
                    {/* Condição para exibir os botões de ação */}
                    {app.status === 'pendente' && !isUserApproved ? (
                      <div className="admin-actions">
                        <button onClick={() => openApproveModal(app.email)} className="btn-success">Aprovar</button>
                        <button onClick={() => openRejectModal(app.email)} className="btn-danger">Rejeitar</button>
                      </div>
                    ) : (
                        <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#555' }}>
                            {app.status === 'aprovado' ? 'Esta aplicação já foi aprovada.' :
                             app.status === 'rejeitado' ? 'Esta aplicação já foi rejeitada.' :
                             'Usuário já aprovado, mas a aplicação ainda está pendente.'} {/* Caso raro */}
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
                        onClick={() => openDeleteUserModal(userItem._id, userItem.email)}
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
                    <button
                      onClick={() => openDeleteProductModal(product._id, product.titulo)}
                      className="btn-danger">
                      Deletar
                    </button>
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
