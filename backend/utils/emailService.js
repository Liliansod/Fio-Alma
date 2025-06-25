const nodemailer = require('nodemailer');

// Configura o transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Use 'true' se a porta for 465 (SSL), 'false' para 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Importante para alguns ambientes de desenvolvimento
  }
});

/**
 * Envia um e-mail usando Nodemailer.
 * @param {string} to - Endereço de e-mail do destinatário.
 * @param {string} subject - Assunto do e-mail.
 * @param {string} text - Conteúdo do e-mail em texto puro.
 * @param {string} html - Conteúdo do e-mail em HTML (opcional, mas recomendado).
 */
const sendEmail = async (to, subject, text, html) => {
  console.log('--- Iniciando função sendEmail ---');
  console.log(`Destinatário: ${to}`);
  console.log(`Assunto: ${subject}`);
  console.log(`Usuário de E-mail Configurado: ${process.env.EMAIL_USER}`); // Para verificar se a variável é lida

  // Testa a verificação de conexão do transporter (opcional, mas útil)
  try {
    await transporter.verify();
    console.log("Transporter está pronto para enviar mensagens.");
  } catch (verifyError) {
    console.error("Erro na verificação do transporter:", verifyError);
    // Se falhar aqui, geralmente é problema de host/port/auth no .env ou firewall
    return false;
  }

  try {
    const mailOptions = {
      from: `"Ateliê Fio & Alma" <${process.env.EMAIL_USER}>`, // Remetente
      to, // Destinatário
      subject, // Assunto
      text, // Corpo do e-mail em texto puro
      html, // Corpo do e-mail em HTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso! ID da mensagem:', info.messageId);
    console.log('URL de visualização (se disponível):', nodemailer.getTestMessageUrl(info)); // Útil para testes
    return true; // Sucesso
  } catch (error) {
    console.error('*** ERRO AO ENVIAR E-MAIL COM NODEMAILER: ***', error);
    console.error('Detalhes do erro:', error.response); // Para erros SMTP
    console.error('Código do erro:', error.code); // Para códigos de erro Nodemailer/SMTP
    return false; // Falha
  } finally {
    console.log('--- Função sendEmail finalizada ---');
  }
};

module.exports = { sendEmail };
