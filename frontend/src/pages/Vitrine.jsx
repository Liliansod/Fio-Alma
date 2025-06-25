import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';

function Vitrine() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products'); // Requisição GET para a API de produtos
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          setError('Erro ao carregar os produtos. Tente novamente mais tarde.');
        }
      } catch (err) {
        console.error('Erro de conexão ao buscar produtos:', err);
        setError('Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // O array vazio garante que o efeito só rode uma vez, no montagem do componente

  if (loading) {
    return (
      <>
        <Header />
        <main className="galeria" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando produtos...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="galeria" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>{error}</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="galeria">
        <div className="grid">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard
                key={product._id} // Usar _id do MongoDB como chave
                id={product._id} // Passar o _id como ID para o link
                imageUrl={product.imagens && product.imagens.length > 0 ? product.imagens[0] : 'https://placehold.co/300x300/e0e0e0/ffffff?text=No+Image'} // Fallback para imagem
                altText={product.titulo}
              />
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%' }}>Nenhum produto encontrado na vitrine.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Vitrine;
