import React from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function Home() {
  return (
    <>
      <Header />
      <main className="container">
        <section className="content">
          <div className="text-img">
            {/* Imagem e texto da seção "Sobre" */}
            <img src="/img/img1.jpg" alt="Costura manual" />
            <p>
              O Ateliê Fio & Alma nasceu da vontade de criar moda com propósito — unindo estética, afeto e autenticidade. Cada peça é desenvolvida com cuidado artesanal e um olhar autoral, valorizando a história por trás de cada criação. Aqui, vestir também é um ato de expressão e identidade.
            </p>
          </div>

          <div className="text-img reverse">
            <p>
              Fundado em 2025, em Campinas (SP), o Fio & Alma nasceu do desejo de refletir uma moda histórica e presente. Em um ateliê acolhedor e íntimo, tecidos ganham formas com intenção e sensibilidade — como um gesto que se veste.
            </p>
            <img src="/img/img2.jpg" alt="Tesoura e tecido" />
          </div>

          <div className="idealizadores">
            <img src="/img/provisoria2.png" alt="Idealizadores" />
            <p>
              {/* Informações sobre os idealizadores */}
              <strong>IDEALIZADORES</strong><br />
              Victória, Jefferson, Lilian e Emily são os idealizadores do Fio & Alma — um espaço que acolhe pessoas e inspira conexões entre saberes indígenas. Muito além de um ateliê, somos um ponto de encontro entre vidas, saberes e formas de criar e identificar-se com afeto, em forma, cor e identidade.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
