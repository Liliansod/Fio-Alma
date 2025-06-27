import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function CreatorDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Estados para Adicionar Produto
  const [newProductData, setNewProductData] = useState({
    titulo: '',
    descricao: '',
    imagens: null, // Para armazenar o FileList de imagens
  });
  const [addingProduct, setAddingProduct] = useState(false); // Para mostrar/esconder formulário

  // Estado para listar os produtos do criador
  const [myProducts, setMyProducts] = useState([]);


  // Redireciona se não estiver autenticado ou não for criador/admin
  useEffect(() => {
    if (!isAuthenticated || (user.role !== 'criador' && user.role !== 'admin')) {
      navigate('/espaco-criador');
    }
  }, [isAuthenticated, user, navigate]);

  // Função para buscar os produtos do criador
  const fetchMyProducts = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await fetch('https://fio-alma-main.onrender.com/api/products/my-products', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Garantir que as URLs das imagens sejam completas
        const productsWithFullImageUrls = data.map(p => ({
          ...p,
          imagens: p.imagens.map(img => `https://fio-alma-main.onrender.com${img}`)
        }));
        setMyProducts(productsWithFullImageUrls);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar seus produtos.');
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError(`Erro ao carregar produtos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user.role === 'criador' || user.role === 'admin')) {
      fetchMyProducts();
    }
  }, [isAuthenticated, user]);


  // Funções para Adicionar Produto
  const handleNewProductChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagens') {
      setNewProductData({ ...newProductData, [name]: files });
    } else {
      setNewProductData({ ...newProductData, [name]: value });
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('titulo', newProductData.titulo);
    formData.append('descricao', newProductData.descricao);

    if (newProductData.imagens && newProductData.imagens.length > 0) {
      for (let i = 0; i < newProductData.imagens.length; i++) {
        formData.append('imagens', newProductData.imagens[i]);
      }
    } else {
      setError('Pelo menos uma imagem é obrigatória para o produto.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://fio-alma-main.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Produto adicionado com sucesso!');
        setNewProductData({ titulo: '', descricao: '', imagens: null }); // Limpa o formulário
        setAddingProduct(false); // Fecha o formulário
        fetchMyProducts(); // Recarrega a lista de produtos
      } else {
        const errorData = await response.json();
        setError(`Erro ao adicionar produto: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao adicionar produto:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  // Funções para Gerenciar Produtos (Edição e Exclusão)
  const handleEditProduct = (productId) => {
    navigate(`/editar-produto/${productId}`); // Redireciona para a nova página de edição
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://fio-alma-main.onrender.com/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        setMessage('Produto deletado com sucesso!');
        fetchMyProducts(); // Recarrega a lista
      } else {
        const errorData = await response.json();
        setError(`Erro ao deletar produto: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao deletar produto:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  // NOVO: Função para lidar com o clique no botão Editar Perfil
  const handleEditProfile = () => {
    navigate('/editar-perfil'); // Navega para a nova rota de edição de perfil
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
          <h2>Carregando Painel do Criador...</h2>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated || (user.role !== 'criador' && user.role !== 'admin')) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />
        <h1>PAINEL DO CRIADOR</h1>
        <p>Bem-vindo, {user.email}!</p>
        <button onClick={handleLogout} className="button-logout">Sair</button>

        {user.role === 'admin' && (
          <div style={{ marginTop: '1rem' }}>
            <Link to="/admin-dashboard" className="btn-admin-access">Acessar Painel Admin</Link>
          </div>
        )}

        {message && <p style={{ textAlign: 'center', color: 'green', marginTop: '1rem' }}>{message}</p>}
        {error && <p style={{ textAlign: 'center', color: 'red', marginTop: '1rem' }}>{error}</p>}

        {/* Seção Adicionar Novo Produto */}
        <section className="form-box-criador" style={{ marginTop: '2rem' }}>
          <h2>Gerenciar Produtos</h2>
          <p>Adicione e gerencie seus produtos aqui.</p>
          {!addingProduct ? (
            <button onClick={() => setAddingProduct(true)} className="btn-primary">Adicionar Novo Produto</button>
          ) : (
            <form onSubmit={handleAddProductSubmit} className="add-product-form">
              <h3>Novo Produto</h3>
              <label>
                Título:<br />
                <input
                  type="text"
                  name="titulo"
                  value={newProductData.titulo}
                  onChange={handleNewProductChange}
                  required
                />
              </label>
              <label>
                Descrição:<br />
                <textarea
                  name="descricao"
                  rows="4"
                  value={newProductData.descricao}
                  onChange={handleNewProductChange}
                  required
                ></textarea>
              </label>
              <label>
                Imagens (até 5):<br />
                <input
                  type="file"
                  name="imagens"
                  onChange={handleNewProductChange}
                  multiple
                  accept="image/*"
                />
              </label>
              <div className="form-actions">
                <button type="submit">Salvar Produto</button>
                <button type="button" onClick={() => setAddingProduct(false)} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          )}
        </section>

        {/* Seção Meus Produtos (Lista) */}
        <section className="form-box-criador" style={{ marginTop: '2rem' }}>
          <h2>Meus Produtos</h2>
          {myProducts.length === 0 && !addingProduct ? (
            <p>Você ainda não tem produtos cadastrados.</p>
          ) : (
            <div className="my-products-list">
              {myProducts.map((product) => (
                <div key={product._id} className="product-item">
                  <h3>{product.titulo}</h3>
                  <p>{product.descricao.substring(0, 150)}...</p>
                  {product.imagens && product.imagens.length > 0 ? (
                    <img
                      src={product.imagens[0]} // Já está com URL completa
                      alt={product.titulo}
                      className="product-list-image"
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/e0e0e0/ffffff?text=Sem+Imagem" }}
                    />
                  ) : (
                    <img src="https://placehold.co/100x100/e0e0e0/ffffff?text=Sem+Imagem" alt="Sem Imagem" className="product-list-image" />
                  )}
                  <div className="product-actions">
                    <Link to={`/detalhe/${product._id}`} className="btn-view">Ver</Link>
                    <button onClick={() => handleEditProduct(product._id)} className="btn-edit">Editar</button>
                    <button onClick={() => handleDeleteProduct(product._id)} className="btn-delete">Deletar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção Gerenciar Perfil */}
        <section className="form-box-criador" style={{ marginTop: '2rem' }}>
          <h2>Gerenciar Perfil</h2>
          <p>E-mail: {user.email}</p>
          <button onClick={handleEditProfile} className="btn-primary">Editar Perfil</button> {/* Chamada para a nova função */}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CreatorDashboard;
