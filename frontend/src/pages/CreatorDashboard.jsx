import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom'; // Adicionado Link para a mensagem de não aprovado

function CreatorDashboard() {
  const { user, isAuthenticated, isApproved, logout } = useAuth();
  const navigate = useNavigate();
  const [creatorProducts, setCreatorProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState('');

  // Redireciona se não estiver autenticado ou aprovado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/espaco-criador'); // Redireciona para o login se não autenticado
    } else if (!isApproved) {
      // Se não aprovado, pode mostrar uma mensagem e impedir acesso total
      navigate('/aguardando-aprovacao'); // Redireciona para uma página de "aguardando"
    }
    // Se autenticado e aprovado, continua na página
  }, [isAuthenticated, isApproved, navigate]);

  // Função para buscar os produtos do criador (simulação por enquanto)
  useEffect(() => {
    if (isAuthenticated && isApproved && user?.id) {
      const fetchCreatorProducts = async () => {
        setLoadingProducts(true);
        setErrorProducts('');
        try {
          // Em um projeto real, esta rota seria algo como:
          // `http://localhost:5000/api/creator/products/${user.id}`
          // e exigiria um token de autenticação no cabeçalho.
          const response = await fetch('http://localhost:5000/api/products'); // Usando todos os produtos por simplicidade
          if (response.ok) {
            const data = await response.json();
            // Filtrar produtos que 'pertencem' a este criador (simulação)
            // Em um sistema real, o backend filtraria isso pelo user.id
            const filteredProducts = data.filter(p => p.criador && p.criador.includes(user.email)); // Usando email como critério, buscando no texto do criador
            setCreatorProducts(filteredProducts);
          } else {
            setErrorProducts('Erro ao carregar seus produtos.');
          }
        } catch (error) {
          console.error("Erro ao buscar produtos do criador:", error);
          setErrorProducts('Erro de conexão ao carregar produtos.');
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchCreatorProducts();
    }
  }, [isAuthenticated, isApproved, user?.id, user?.email]);


  // Se o usuário não está autenticado ou aprovado, não renderiza o conteúdo
  if (!isAuthenticated || !isApproved) {
    return (
      <>
        <Header />
        <main className="container-criador" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar autenticado e ter sua conta aprovada para acessar esta área.</p>
          {!isAuthenticated && <Link to="/espaco-criador" className="botao-registro">Fazer Login</Link>}
          {isAuthenticated && !isApproved && <p>Sua conta ainda está aguardando aprovação.</p>}
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container-criador" style={{ textAlign: 'left', padding: '2rem' }}>
        <h1>PAINEL DO CRIADOR</h1>
        {user && <p>Bem-vindo, {user.email}!</p>}
        <button onClick={logout} className="botao-registro" style={{ marginBottom: '2rem' }}>Sair</button>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Gerenciar Produtos</h2>
          {loadingProducts ? (
            <p>Carregando produtos...</p>
          ) : errorProducts ? (
            <p style={{ color: 'red' }}>{errorProducts}</p>
          ) : creatorProducts.length > 0 ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              {creatorProducts.map(product => (
                <div key={product._id} className="card" style={{ height: '250px' }}>
                  <img src={product.imagens[0]} alt={product.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                  <h4 style={{ textAlign: 'center', marginTop: '0.5rem' }}>{product.titulo}</h4>
                  {/* Adicionar botões de Editar/Remover */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.5rem' }}>
                    <button style={{padding: '0.3rem 0.5rem', fontSize: '0.8rem'}}>Editar</button>
                    <button style={{padding: '0.3rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#a00'}}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Você ainda não tem produtos cadastrados. Adicione seu primeiro produto!</p>
          )}
          <button className="botao-registro" style={{ marginTop: '1rem' }}>Adicionar Novo Produto</button>
        </section>

        <section>
          <h2>Gerenciar Perfil</h2>
          <p>Nome: {user?.email}</p> {/* Substitua pelo nome real do usuário */}
          <button className="botao-registro" style={{ marginTop: '1rem' }}>Editar Perfil</button>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CreatorDashboard;
