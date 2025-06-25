import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// ProtectedRoute agora aceita uma prop `roles`
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Pode retornar um spinner de carregamento aqui
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando autenticação...</div>;
  }

  if (!isAuthenticated) {
    // Não autenticado, redireciona para a página de login
    return <Navigate to="/espaco-criador" replace />;
  }

  // Se roles for fornecido, verifica se o usuário tem uma das roles permitidas
  if (roles && roles.length > 0) {
    if (!user || !roles.includes(user.role)) {
      // Usuário não tem a role necessária, redireciona para uma página de acesso negado ou painel padrão
      console.warn(`Acesso negado para o usuário ${user?.email} com role ${user?.role}. Requer uma das roles: ${roles.join(', ')}`);
      // Poderíamos redirecionar para um 403 Forbidden page, ou para o painel de criador se ele for criador.
      // Por simplicidade, redireciona para o login ou uma página de "acesso negado".
      return <Navigate to="/espaco-criador" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
