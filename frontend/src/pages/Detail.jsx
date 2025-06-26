import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Carousel from '../components/Carousel.jsx';

function Detail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState('');


  // Efeito para buscar os detalhes do produto da API
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoadingProduct(true);
      setProductError('');
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`); // Requisição GET para um produto específico
        if (response.ok) {
          const data = await response.json();
          // Certifique-se de que as URLs das imagens incluem o domínio do backend
          const updatedImages = data.imagens.map(img => `http://localhost:5000${img}`);
          setProduct({ ...data, imagens: updatedImages });
        } else if (response.status === 404) {
          setProductError('Produto não encontrado.');
        } else {
          setProductError('Erro ao carregar detalhes do produto. Tente novamente mais tarde.');
        }
      } catch (err) {
        console.error('Erro de conexão ao buscar detalhes do produto:', err);
        setProductError('Não foi possível conectar ao servidor para carregar o produto.');
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [id]); // Roda novamente se o ID do produto na URL mudar

  // Lida com a mudança nos campos do formulário de contato
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Lida com o envio do formulário de contato
  const handleSubmit = async (e) => {
    e.preventDefault();
    setContactMessage('');
    setContactError('');
    setContactMessage('Enviando...');

    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, productId: id, productName: product?.titulo }),
      });

      if (response.ok) {
        setContactMessage('Sua mensagem foi enviada ao criador! Ele(a) entrará em contato em breve.');
        setFormData({ // Limpa o formulário
          nome: '',
          email: '',
          telefone: '',
          mensagem: ''
        });
      } else {
        const errorData = await response.json();
        setContactError(`Erro ao enviar mensagem: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro ao enviar formulário de contato:', err);
      setContactError('Erro de conexão ao enviar a mensagem. Tente novamente mais tarde.');
    }
  };

  if (loadingProduct) {
    return (
      <>
        <Header />
        <main className="pagina-detalhe" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando detalhes do produto...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (productError) {
    return (
      <>
        <Header />
        <main className="pagina-detalhe" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>{productError}</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    // Isso pode acontecer se o produto não for encontrado, mas o erro não foi capturado acima
    return (
      <>
        <Header />
        <main className="pagina-detalhe" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Produto não disponível.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pagina-detalhe">
        <section className="detalhe-produto">
          {product.imagens && product.imagens.length > 0 ? (
            <Carousel images={product.imagens} title={product.titulo} />
          ) : (
            <div className="imagem-produto" style={{ maxWidth: '300px' }}>
              <img src="https://placehold.co/300x300/e0e0e0/ffffff?text=No+Image" alt="Produto sem imagem disponível" className="imagem-carrossel" />
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>Nenhuma imagem disponível.</p>
            </div>
          )}

          <div className="descricao-produto">
            <h2 id="titulo-produto">{product.titulo}</h2>
            <p id="descricao-produto">{product.descricao}</p>
            <div className="info-criador">
              <h3>Informações sobre o criador</h3>
              <p id="info-criador">{product.criador}</p>
            </div>
          </div>
        </section>

        <section className="formulario-contato">
          <h3>Gostou? Preencha o formulário para o criador confeccioná-la para você</h3>
          <form onSubmit={handleSubmit}>
            <label>Nome:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
            <label>E-mail:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            <label>Telefone:</label>
            <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} />
            <label>Mensagem:</label>
            <textarea name="mensagem" rows="4" value={formData.mensagem} onChange={handleChange} required></textarea>
            <button type="submit">Enviar</button>
          </form>
          {contactMessage && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'green' }}>{contactMessage}</p>}
          {contactError && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'red' }}>{contactError}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Detail;
