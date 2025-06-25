import React, { useState, useEffect } from 'react';

function Carousel({ images, title }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Efeito para resetar o índice da imagem quando as imagens mudam (por exemplo, ao mudar de produto)
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [images]);

  // Função para voltar para a imagem anterior
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + images.length) % images.length
    );
  };

  // Função para avançar para a próxima imagem
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  if (!images || images.length === 0) {
    return <p>Nenhuma imagem disponível.</p>;
  }

  return (
    <div className="imagem-produto">
      {/* Imagem atual do carrossel */}
      <img
        src={images[currentImageIndex]}
        alt={`${title} - Imagem ${currentImageIndex + 1}`}
        className="imagem-carrossel"
      />
      <div className="setas-carrossel">
        {/* Botões de navegação do carrossel */}
        <button onClick={goToPrevious}>◀</button>
        <button onClick={goToNext}>▶</button>
      </div>
    </div>
  );
}

export default Carousel;
