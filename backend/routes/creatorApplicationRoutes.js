const express = require('express');
const router = express.Router();
const multer = require('multer'); // Middleware para upload de arquivos
const path = require('path');
const CreatorApplication = require('../models/CreatorApplication'); // Importa o modelo
const { sendEmail } = require('../utils/emailService'); // Importa o serviço de e-mail

// Configuração do Multer para armazenamento de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define o diretório onde as imagens serão salvas
    // Certifique-se de que a pasta 'uploads' exista na raiz do seu backend
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Define o nome do arquivo, combinando o nome original com um timestamp para evitar colisões
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage }); // Inicializa o Multer com a configuração de armazenamento

// Rota para criar uma nova aplicação de criador com upload de imagem
router.post('/', upload.single('imagem'), async (req, res) => {
  console.log('Recebida nova aplicação de criador.');
  try {
    const { nome, telefone, email, mensagem } = req.body;
    let imagemUrl = null;

    if (req.file) {
      imagemUrl = `/uploads/${req.file.filename}`;
      console.log(`Imagem anexada: ${req.file.filename}, URL: ${imagemUrl}`);
    } else {
      console.log('Nenhuma imagem anexada na aplicação.');
    }

    const newApplication = new CreatorApplication({
      nome,
      telefone,
      email,
      mensagem,
      imagemUrl // Salva a URL da imagem no banco de dados
    });

    const savedApplication = await newApplication.save();
    console.log('Aplicação de criador salva no MongoDB:', savedApplication._id);

    // --- ENVIAR E-MAIL DE NOTIFICAÇÃO PARA A EQUIPE DO ATELIÊ ---
    const equipeEmail = 'ateliefioealma@gmail.com'; // O e-mail da sua equipe
    const subject = `Nova Aplicação de Criador (Faça Parte): ${nome}`;
    const text = `
      Uma nova aplicação de criador foi submetida pelo formulário "Faça Parte":

      Nome: ${nome}
      E-mail: ${email}
      Telefone: ${telefone}
      Mensagem: ${mensagem}
      ${imagemUrl ? `Link da Imagem: http://localhost:5000${imagemUrl}` : 'Nenhuma imagem anexada.'}

      Status inicial: ${savedApplication.status}
      Data de Envio: ${savedApplication.dataEnvio}

      Por favor, revise esta aplicação no seu painel de administração e aprove ou rejeite o criador.
    `;
    const html = `
      <p>Uma nova aplicação de criador foi submetida pelo formulário "Faça Parte":</p>
      <ul>
        <li><strong>Nome:</strong> ${nome}</li>
        <li><strong>E-mail:</strong> ${email}</li>
        <li><strong>Telefone:</strong> ${telefone}</li>
        <li><strong>Mensagem:</strong> ${mensagem}</li>
        ${imagemUrl ? `<li><strong>Link da Imagem:</strong> <a href="http://localhost:5000${imagemUrl}">Ver Imagem</a></li>` : '<li>Nenhuma imagem anexada.</li>'}
      </ul>
      <p><strong>Status inicial:</strong> ${savedApplication.status}</p>
      <p><strong>Data de Envio:</strong> ${savedApplication.dataEnvio}</p>
      <p>Por favor, revise esta aplicação no seu painel de administração e aprove ou rejeite o criador.</p>
    `;

    console.log('Tentando enviar e-mail de notificação de aplicação para a equipe...');
    // A função sendEmail já tem seus próprios console.log para status de envio e erros.
    const emailSent = await sendEmail(equipeEmail, subject, text, html);

    if (emailSent) {
      console.log('E-mail de notificação de aplicação para a equipe enviado com sucesso.');
    } else {
      console.error('Falha ao enviar e-mail de notificação de aplicação para a equipe.');
    }

    res.status(201).json(savedApplication);
  } catch (err) {
    console.error('*** ERRO GERAL NO PROCESSAMENTO DA APLICAÇÃO DE CRIADOR: ***', err);
    res.status(400).json({ message: 'Erro ao enviar aplicação de criador', error: err.message });
  }
});

// Rota para obter todas as aplicações de criador (para gerenciamento)
router.get('/', async (req, res) => {
  try {
    const applications = await CreatorApplication.find({});
    res.json(applications);
  } catch (err) {
    console.error('Erro ao buscar aplicações de criador:', err);
    res.status(500).json({ message: 'Erro do servidor ao buscar aplicações' });
  }
});

module.exports = router;
