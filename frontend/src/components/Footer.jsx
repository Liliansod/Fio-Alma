import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="txt-social" id="txt-social">
        {/* Citação no rodapé */}
        <h1> "Confiança é um tecido delicado que não aceita remendos"</h1>
      </div>
      <div className="social">
        {/* Links para redes sociais com ícones do Bootstrap */}
        <div>
          {/* Adicionado role="button" e tabIndex="0" para acessibilidade e para satisfazer o linter */}
          <a href="#" role="button" tabIndex="0"><i className="bi bi-facebook"></i></a>
        </div>
        <div>
          <a href="#" role="button" tabIndex="0"><i className="bi bi-instagram"></i></a>
        </div>
        <div>
          <a href="#" role="button" tabIndex="0"><i className="bi bi-whatsapp"></i></a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
