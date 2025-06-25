import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function EditProduct() {
  const { id } = useParams(); // Pega o ID do produto da URL
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newImages, setNewImages] = useState(null); // Para novas imagens a serem enviadas

  useEffect(() => {
    // Redireciona se não estiver autenticado ou não tiver permissão
    if (!isAuthenticated || (user.role !== 'criador' && user.role !== 'admin')) {
      navigate('/espaco-criador');
      return;
    }

    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          headers: { 'x-auth-token': token }
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Falha ao buscar produto.');
        }
        const data = await res.json();
        // Verifica se o usuário logado é o criador do produto ou um admin
        if (data.criador !== user.email && user.role !== 'admin') {
          setError('Você não tem permissão para editar este produto.');
          setLoading(false);
          return;
        }
        setProduct(data);
      } catch (err) {
        console.error('Erro ao buscar produto para edição:', err);
        setError(`Erro ao carregar produto: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    setNewImages(e.target.files); // Salva o FileList de novas imagens
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!product) return;

    const formData = new FormData();
    formData.append('titulo', product.titulo);
    formData.append('descricao', product.descricao);

    // Se novas imagens foram selecionadas, adiciona-as ao FormData
    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        formData.append('imagens', newImages[i]);
      }
    } else {
      // Se NENHUMA nova imagem foi selecionada, e o produto tinha imagens existentes,
      // queremos enviar as URLs existentes de volta para o backend para que ele as mantenha.
      // O backend esperará isso como um JSON stringificado no campo 'imagens'.
      if (product.imagens && product.imagens.length > 0) {
        formData.append('imagens', JSON.stringify(product.imagens));
      } else {
        // Se não tinha imagens e não selecionou novas, ainda pode ser válido.
        formData.append('imagens', JSON.stringify([])); // Envia array vazio para limpar ou manter vazio
      }
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
          // Não defina Content-Type: 'application/json' ao usar FormData com arquivos
        },
        body: formData,
      });

      if (res.ok) {
        setMessage('Produto atualizado com sucesso!');
        // Redireciona de volta para o painel do criador após a edição
        setTimeout(() => navigate('/painel-criador'), 1500);
      } else {
        const errorData = await res.json();
        setError(`Erro ao atualizar produto: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error('Erro de conexão ao atualizar produto:', err);
      setError('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container-criador" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Carregando produto para edição...</h2>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !product) { // Exibe o erro se não conseguiu carregar o produto
    return (
      <>
        <Header />
        <main className="container-criador" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'red' }}>{error}</p>
          <Link to="/painel-criador" className="btn-secondary">Voltar ao Painel</Link>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) { // Se não encontrou o produto após o loading
    return (
      <>
        <Header />
        <main className="container-criador" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Produto não encontrado.</h2>
          <Link to="/painel-criador" className="btn-secondary">Voltar ao Painel</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container-criador">
        <img src="/img/logo.png" alt="Logo Ateliê Fio & Alma" className="logo" />
        <h1>EDITAR PRODUTO</h1>
        <p>Ajuste os detalhes do seu produto.</p>

        <section className="form-box-criador">
          <h2>Editar "{product.titulo}"</h2>
          <form onSubmit={handleSubmit} className="edit-product-form">
            <label>
              Título:<br />
              <input
                type="text"
                name="titulo"
                value={product.titulo}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Descrição:<br />
              <textarea
                name="descricao"
                rows="6"
                value={product.descricao}
                onChange={handleChange}
                required
              ></textarea>
            </label>
            <label>
              Imagens Atuais:<br />
              <div className="current-images-preview">
                {product.imagens && product.imagens.length > 0 ? (
                  product.imagens.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000${imgUrl}`}
                      alt={`Imagem ${index + 1}`}
                      className="product-edit-image-preview"
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/e0e0e0/ffffff?text=Falha" }}
                    />
                  ))
                ) : (
                  <p>Nenhuma imagem atual.</p>
                )}
              </div>
            </label>
            <label>
              Novas Imagens (substituirão as atuais se selecionadas, até 5):<br />
              <input
                type="file"
                name="newImages"
                onChange={handleImageChange}
                multiple
                accept="image/*"
              />
            </label>
            <div className="form-actions">
              <button type="submit">Salvar Alterações</button>
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

export default EditProduct;
