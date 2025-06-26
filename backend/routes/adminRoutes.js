const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importa o modelo de Usuário
const CreatorApplication = require('../models/CreatorApplication'); // Importa o modelo de Aplicação de Criador
const Product = require('../models/Product'); // Importa o modelo de Produto
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware de autenticação
const { sendEmail } = require('../utils/emailService'); // Importa o serviço de e-mail
const bcrypt = require('bcryptjs'); // Para gerar senha (se for para criar usuário manualmente)
const jwt = require('jsonwebtoken'); // Para gerar token para novos admins

// Função auxiliar para gerar senhas aleatórias (duplicado do authRoutes, mas útil aqui)
function generateRandomPassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// --- ROTAS PROTEGIDAS POR ADMIN ---
// TODAS as rotas neste arquivo DEVEM ser protegidas pelo authMiddleware e pelo middleware admin.
// A ordem é importante: authMiddleware primeiro para popular req.user, depois admin.

// Rota para obter todas as aplicações de criadores
router.get('/applications', authMiddleware, authMiddleware.admin, async (req, res) => {
  try {
    console.log('Admin: Buscando todas as aplicações de criadores.');
    const applications = await CreatorApplication.find({});
    res.json(applications);
  } catch (err) {
    console.error('Erro ao buscar aplicações de criadores (Admin):', err);
    res.status(500).json({ message: 'Erro do servidor ao buscar aplicações', error: err.message });
  }
});

// As rotas de approve-creator e reject-creator foram MOVIDAS para authRoutes.js para centralização.
// Se você tinha outras rotas aqui, elas devem permanecer.

// Rota para obter todos os usuários (criadores e admins)
router.get('/users', authMiddleware, authMiddleware.admin, async (req, res) => {
  try {
    console.log('Admin: Buscando todos os usuários.');
    // Não retorna a senha para segurança
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Erro ao buscar usuários (Admin):', err);
    res.status(500).json({ message: 'Erro do servidor ao buscar usuários', error: err.message });
  }
});

// Rota para obter todos os produtos
router.get('/products', authMiddleware, authMiddleware.admin, async (req, res) => {
  try {
    console.log('Admin: Buscando todos os produtos.');
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error('Erro ao buscar produtos (Admin):', err);
    res.status(500).json({ message: 'Erro do servidor ao buscar produtos', error: err.message });
  }
});

module.exports = router;
