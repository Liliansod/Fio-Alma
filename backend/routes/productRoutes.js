const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Importa o modelo de Produto
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware de autenticação
const multer = require('multer'); // Middleware para upload de arquivos
const path = require('path');

// Configuração do Multer para armazenamento de imagens de produtos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// --- ROTAS PÚBLICAS GERAIS ---

// Rota para obter todos os produtos (para a vitrine principal)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error('Erro do servidor ao buscar todos os produtos:', err);
    res.status(500).json({ message: 'Erro do servidor ao buscar todos os produtos' });
  }
});

// --- ROTAS PROTEGIDAS PARA CRIADORES E ADMINS ---

// NOVO: Esta rota deve vir ANTES de router.get('/:id')
// Rota para o criador obter APENAS OS SEUS produtos
router.get('/my-products', authMiddleware, async (req, res) => {
  try {
    const criadorEmail = req.user.email;
    const products = await Product.find({ criador: criadorEmail });
    res.json(products);
  } catch (err) {
    console.error('Erro ao buscar produtos do criador:', err);
    res.status(500).json({ message: 'Erro do servidor ao buscar seus produtos' });
  }
});

// Rota para o criador adicionar um novo produto (com upload de imagem)
router.post('/', authMiddleware, upload.array('imagens', 5), async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const criadorEmail = req.user.email;
    let imagensUrls = [];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Pelo menos uma imagem é obrigatória para o produto.' });
    }
    imagensUrls = req.files.map(file => `/uploads/${file.filename}`);
    console.log('Imagens uploaded para o produto:', imagensUrls);

    const newProduct = new Product({
      titulo,
      descricao,
      criador: criadorEmail,
      imagens: imagensUrls
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(400).json({ message: 'Erro ao criar produto', error: err.message });
  }
});

// Rota para atualizar um produto existente
router.put('/:id', authMiddleware, upload.array('imagens', 5), async (req, res) => {
  try {
    const productId = req.params.id;
    const { titulo, descricao } = req.body;
    const criadorEmail = req.user.email;
    const userRole = req.user.role;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado para atualização' });
    }

    if (product.criador !== criadorEmail && userRole !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para atualizar este produto.' });
    }

    let imagensUrls = product.imagens;
    if (req.files && req.files.length > 0) {
      imagensUrls = req.files.map(file => `/uploads/${file.filename}`);
      console.log('Novas imagens uploaded para o produto:', imagensUrls);
    } else if (req.body.imagens) {
      try {
        imagensUrls = JSON.parse(req.body.imagens);
      } catch (parseError) {
        console.warn('Erro ao parsear URLs de imagens existentes do body (não é JSON válido):', parseError);
        imagensUrls = Array.isArray(req.body.imagens) ? req.body.imagens : [req.body.imagens];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId,
      { titulo, descricao, imagens: imagensUrls },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(400).json({ message: 'Erro ao atualizar produto', error: err.message });
  }
});

// Rota para deletar um produto
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const criadorEmail = req.user.email;
    const userRole = req.user.role;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado para exclusão' });
    }

    if (product.criador !== criadorEmail && userRole !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para deletar este produto.' });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);
    res.json({ message: 'Produto deletado com sucesso', deletedProduct });
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
    res.status(500).json({ message: 'Erro ao deletar produto', error: err.message });
  }
});

// ESTA ROTA GENÉRICA COM :id DEVE VIR POR ÚLTIMO para evitar colisões
// Rota para obter um produto por ID (pode ser usado pela vitrine ou pelo criador para detalhes)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (err) {
    console.error('Erro do servidor ao buscar produto por ID:', err);
    // Este CastError é o que estávamos vendo, agora deve ser evitado
    res.status(500).json({ message: 'Erro do servidor ao buscar produto por ID' });
  }
});

module.exports = router;
