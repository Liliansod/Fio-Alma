import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ id, imageUrl, altText }) {
  return (
    <div className="card">
      {/* Link para a página de detalhes do produto, passando o ID */}
      <Link to={`/detalhe/${id}`}>
        {/* Imagem do produto */}
        <img src={imageUrl} alt={altText} />
      </Link>
    </div>
  );
}

export default ProductCard;
