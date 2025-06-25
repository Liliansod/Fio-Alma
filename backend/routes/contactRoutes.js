const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Importa o modelo de Contato
const Product = require('../models/Product'); // NOVO: Importa o modelo de Produto para pegar o email do criador
const { sendEmail } = require('../utils/emailService'); // NOVO: Importa o serviço de e-mail

// Rota para criar um novo contato (formulário "Gostou?")
router.post('/', async (req, res) => {
  console.log('Recebida nova submissão do formulário "Gostou?".');
  try {
    const { nome, email, telefone, mensagem, productId, productName } = req.body;

    const newContact = new Contact({
      nome,
      email,
      telefone,
      mensagem,
      productId,
      productName
    });

    const savedContact = await newContact.save();
    console.log('Contato salvo no MongoDB:', savedContact._id);

    // --- LÓGICA PARA ENVIAR E-MAIL AO CRIADOR DO PRODUTO ---
    let criadorEmail = '';
    let productTitle = productName || 'Produto Desconhecido';

    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        criadorEmail = product.criador; // Pega o e-mail do criador do produto
        productTitle = product.titulo;
        console.log(`E-mail do criador do produto (${productTitle}): ${criadorEmail}`);
      } else {
        console.warn(`Produto com ID ${productId} não encontrado para o contato.`);
      }
    }

    if (criadorEmail) {
      const subject = `Nova Mensagem no seu Produto "${productTitle}" - Ateliê Fio & Alma`;
      const text = `
        Olá!

        Você recebeu uma nova mensagem sobre o seu produto "${productTitle}" no Ateliê Fio & Alma:

        Nome do Contato: ${nome}
        E-mail do Contato: ${email}
        Telefone do Contato: ${telefone || 'Não informado'}
        Mensagem:
        "${mensagem}"

        Por favor, entre em contato com ${nome} (${email}) o mais breve possível.
      `;
      const html = `
        <p>Olá!</p>
        <p>Você recebeu uma nova mensagem sobre o seu produto "<strong>${productTitle}</strong>" no Ateliê Fio & Alma:</p>
        <ul>
          <li><strong>Nome do Contato:</strong> ${nome}</li>
          <li><strong>E-mail do Contato:</strong> ${email}</li>
          <li><strong>Telefone do Contato:</strong> ${telefone || '<i>Não informado</i>'}</li>
          <li><strong>Mensagem:</strong><br>${mensagem.replace(/\n/g, '<br>')}</li>
        </ul>
        <p>Por favor, entre em contato com <strong>${nome}</strong> (${email}) o mais breve possível.</p>
        <p>Atenciosamente,<br>Equipe Ateliê Fio & Alma</p>
      `;

      console.log(`Tentando enviar e-mail de contato para o criador: ${criadorEmail}`);
      const emailSent = await sendEmail(criadorEmail, subject, text, html);

      if (emailSent) {
        console.log('E-mail de contato enviado com sucesso para o criador.');
      } else {
        console.error('Falha ao enviar e-mail de contato para o criador.');
      }
    } else {
      console.warn('E-mail do criador não encontrado ou não definido, e-mail de contato não enviado.');
    }
    // --- FIM DA LÓGICA DE E-MAIL ---

    res.status(201).json(savedContact); // Retorna o contato salvo (mesmo que o e-mail não tenha sido enviado)
  } catch (err) {
    console.error('Erro ao salvar contato:', err);
    res.status(400).json({ message: 'Erro ao enviar contato', error: err.message });
  }
});

// Rota para obter todos os contatos (para gerenciamento no backend, por exemplo)
// Esta rota precisaria de autenticação e autorização em um projeto real (ex: apenas admin)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.json(contacts);
  } catch (err) {
    console.error('Erro ao buscar contatos:', err);
    res.status(500).json({ message: 'Erro do servidor ao buscar contatos' });
  }
});

module.exports = router;
