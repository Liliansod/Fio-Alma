import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css'; // Importa os estilos globais
import App from './App.jsx'; // Importa o componente principal App (agora .jsx)
import { AuthProvider } from './context/AuthContext.jsx'; // Importa o AuthProvider (agora .jsx)

// Cria um "root" do React para renderizar o aplicativo
const root = ReactDOM.createRoot(document.getElementById('root'));
// Renderiza o componente App dentro do elemento com id 'root'
root.render(
  <React.StrictMode>
    {/* Envolve o App com o AuthProvider para disponibilizar o contexto de autenticação */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
