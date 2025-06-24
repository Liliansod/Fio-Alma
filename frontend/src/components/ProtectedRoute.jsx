import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Atualizado para .jsx

// Este componente verifica se o usuário está autenticado e aprovado
// Antes de renderizar os componentes filhos (rotas protegidas)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isApproved } = useAuth(); // Obtém o estado de autenticação e aprovação

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login
    return <Navigate to="/espaco-criador" replace />;
  }

  if (!isApproved) {
    // Se não estiver aprovado, redireciona para uma página de aviso (ou login novamente)
    // Isso é importante para o fluxo de aprovação manual
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  // Se estiver autenticado e aprovado, renderiza os componentes filhos
  return children;
};

export default ProtectedRoute;
