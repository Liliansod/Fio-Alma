    const nodemailer = require('nodemailer');

    // Configura o transporter do Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Para porta 587 (TLS), secure deve ser false
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Isso é importante para ambientes de desenvolvimento onde o certificado do servidor pode não ser validado
        // Em produção, isso deve ser 'true' se você tiver um certificado válido ou estiver usando um serviço de e-mail confiável
        rejectUnauthorized: false
      }
    });

    const sendEmail = async (to, subject, text, html) => {
      console.log('--- Iniciando função sendEmail ---');
      console.log(`Destinatário: ${to}`);
      console.log(`Assunto: ${subject}`);
      console.log(`Usuário de E-mail Configurado: ${process.env.EMAIL_USER}`);

      try {
        // Teste de verificação de conexão (apenas tenta autenticar e conectar)
        await transporter.verify();
        console.log("Transporter está pronto para enviar mensagens.");
      } catch (verifyError) {
        console.error("Erro na VERIFICAÇÃO do transporter (autenticação SMTP):", verifyError);
        console.error("Detalhes do erro de verificação:", verifyError.response);
        console.error("Código do erro de verificação:", verifyError.code);
        return false; // Retorna falso se a verificação falhar
      }

      try {
        const mailOptions = {
          from: `"Ateliê Fio & Alma" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          text,
          html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso! ID da mensagem:', info.messageId);
        console.log('URL de visualização (se disponível):', nodemailer.getTestMessageUrl(info));
        return true;
      } catch (error) {
        console.error('*** ERRO AO ENVIAR E-MAIL COM NODEMAILER (durante sendMail): ***', error);
        console.error('Detalhes do erro:', error.response); // Para erros SMTP
        console.error('Código do erro:', error.code); // Para códigos de erro Nodemailer/SMTP
        return false;
      } finally {
        console.log('--- Função sendEmail finalizada ---');
      }
    };

    module.exports = { sendEmail };
    