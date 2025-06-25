import React, { createContext, useState, useEffect, useContext } from 'react';

// Cria o contexto de autenticação
const AuthContext = createContext(null);

// Componente provedor de autenticação
export const AuthProvider = ({ children }) => {
  // Estado para armazenar o token de autenticação e as informações do usuário
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Poderíamos decodificar o token para obter info do usuário

  // Efeito para carregar informações do usuário quando o token muda ou no carregamento inicial
  useEffect(() => {
    if (token) {
      // Idealmente, você faria uma requisição ao backend para validar o token
      // e obter os dados do usuário, garantindo que o token não é apenas "qualquer coisa"
      // Por simplicidade, aqui vamos apenas simular a obtenção do usuário.
      // Em uma aplicação real, você faria:
      /*
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          logout(); // Token inválido ou expirado
        }
      })
      .catch(error => {
        console.error("Erro ao validar token:", error);
        logout();
      });
      */

      // Simulação: se tiver um token, assume que está logado e tem um papel de criador (para testar)
      // Em produção, isso viria do backend após validação do token
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do JWT
        setUser({
          id: decodedToken.user.id,
          email: decodedToken.user.email, // Supondo que o email está no token
          role: decodedToken.user.role,
          approved: decodedToken.user.approved // Supondo que a flag de aprovação está no token
        });
      } catch (e) {
        console.error("Erro ao decodificar token:", e);
        logout();
      }

    } else {
      setUser(null); // Nenhuma token, nenhum usuário
    }
  }, [token]);

  // Função para lidar com o login
  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken); // Armazena o token no localStorage
    setToken(newToken);
    setUser(userData); // Define os dados do usuário
  };

  // Função para lidar com o logout
  const logout = () => {
    localStorage.removeItem('token'); // Remove o token do localStorage
    setToken(null);
    setUser(null);
  };

  // Objeto de valor que será provido para os componentes filhos
  const authContextValue = {
    token,
    user,
    isAuthenticated: !!token, // Verdadeiro se houver um token
    isApproved: user?.approved === true, // Verdadeiro se o usuário estiver aprovado
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};
