const express = require('express');
const router = express.Router();
const multer = require('multer'); // Middleware para upload de arquivos
const path = require('path');
const CreatorApplication = require('../models/CreatorApplication'); // Importa o modelo

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
  try {
    // req.file contém informações sobre o arquivo enviado (se houver)
    // req.body contém os outros campos do formulário
    const { nome, telefone, email, mensagem } = req.body;
    let imagemUrl = null;

    if (req.file) {
      // Se um arquivo foi enviado, a URL da imagem será baseada no caminho de uploads
      imagemUrl = `/uploads/${req.file.filename}`;
    }

    const newApplication = new CreatorApplication({
      nome,
      telefone,
      email,
      mensagem,
      imagemUrl // Salva a URL da imagem no banco de dados
    });

    const savedApplication = await newApplication.save();
    res.status(201).json(savedApplication);
  } catch (err) {
    console.error('Erro ao salvar aplicação de criador:', err);
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
