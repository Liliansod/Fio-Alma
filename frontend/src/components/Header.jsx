import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link para navegação

function Header() {
  return (
    <header>
      {/* Imagem do cabeçalho */}
      <img src="/img/capa1.png" alt="Ateliê Fio & Alma" className="header-img" />
      {/* Componente de navegação/menu */}
      <nav className="menu">
        <Link to="/">Sobre</Link>
        <Link to="/vitrine">Vitrine</Link>
        <Link to="/facaparte">Faça parte</Link>
        <Link to="/espaco-criador">Espaço do Criador</Link>
      </nav>
    </header>
  );
}

export default Header;
