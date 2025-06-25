import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function Participate() {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    mensagem: '',
    imagem: null // Para o arquivo de imagem
  });
  const [message, setMessage] = useState(''); // Estado para mensagens de feedback ao usuário
  const [error, setError] = useState('');

  // Lida com a mudança nos campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Lida com a mudança no campo de arquivo
  const handleFileChange = (e) => {
    setFormData({ ...formData, imagem: e.target.files[0] });
  };

  // Lida com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Limpa mensagens anteriores
    setError('');   // Limpa erros anteriores
    setMessage('Enviando...'); // Mensagem de carregamento

    // Cria um objeto FormData para enviar dados, incluindo o arquivo
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      // Faz a requisição POST para o backend
      // A URL da API será configurada no backend
      const response = await fetch('http://localhost:5000/api/creator-applications', {
        method: 'POST',
        body: data, // FormData é enviado diretamente
      });

      if (response.ok) {
        setMessage('Sua aplicação foi enviada com sucesso! Entraremos em contato em breve.');
        setFormData({ // Limpa o formulário
          nome: '',
          telefone: '',
          email: '',
          mensagem: '',
          imagem: null
        });
        // Opcional: resetar input de arquivo visualmente
        e.target.reset(); 
      } else {
        const errorData = await response.json();
        setError(`Erro ao enviar aplicação: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      setError('Erro de conexão ao enviar a aplicação. Tente novamente mais tarde.');
    }
  };

  return (
    <>
      <Header />
      <main className="container">
        <section className="intro">
          <img src="/img/espaço-criador.jpg" alt="Criador com tecidos" className="img-intro"/>
          <p>
            Aqui é o Espaço do Criador. Um espaço que reservamos a você, criador, para compartilhar sua criação conosco. Gostou do que viu e quer ver sua peça autoral feita à mão exposta no nosso site?
          </p>
        </section>

        <section className="formulario">
          <h2>Deixe-nos te conhecer melhor e nos conte por que quer participar do nosso ateliê:</h2>
          <form onSubmit={handleSubmit}>
            <div className="campo-duplo">
              <label>
                Nome:<br />
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
              </label>
              <label>
                Telefone:<br />
                <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} required />
              </label>
            </div>

            <label>
              E-mail:<br />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </label>

            <label>
              Mensagem:<br />
              <textarea name="mensagem" rows="4" value={formData.mensagem} onChange={handleChange} required></textarea>
            </label>

            <label className="upload-label">
              Anexe a imagem da peça que será exibida em nossa vitrine!<br />
              <input type="file" name="imagem" onChange={handleFileChange} />
            </label>

            <button type="submit">ENVIAR</button>
          </form>
          {/* Exibe mensagens de feedback */}
          {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'green' }}>{message}</p>}
          {error && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'red' }}>{error}</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Participate;
