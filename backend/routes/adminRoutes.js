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

// Rota para aprovar uma aplicação de criador e criar/aprovar o usuário
// Esta rota é um pouco redundante com a que já temos em authRoutes.js
// Mas vou mantê-la aqui para consolidar as funções administrativas.
router.post('/approve-creator', authMiddleware, authMiddleware.admin, async (req, res) => {
  const { applicationId } = req.body; // Agora aprovamos pela ID da aplicação
  console.log(`Admin: Solicitada aprovação para a aplicação ID: ${applicationId}`);

  try {
    // 1. Encontrar a aplicação
    const application = await CreatorApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Aplicação não encontrada.' });
    }

    // 2. Encontrar ou criar o usuário associado
    let user = await User.findOne({ email: application.email });
    if (!user) {
      // Se o usuário não existe, isso significa que a aplicação "Faça Parte" foi feita
      // mas o usuário não se registrou na tela de registro.
      // Neste cenário, o admin criará o usuário.
      const tempPassword = generateRandomPassword(); // Gera uma senha para o novo usuário
      user = new User({
        email: application.email,
        password: tempPassword, // Será hasheada pelo pre-save middleware
        role: 'criador', // Define como criador
        approved: true, // Já aprovado ao ser criado por admin
        isFirstLogin: true // Força a troca de senha
      });
      await user.save();
      console.log(`Admin: Novo usuário criado a partir da aplicação: ${user.email}`);

      // Atualiza o status da aplicação para aprovado
      application.status = 'aprovado';
      await application.save();

      // Enviar e-mail para o criador com as credenciais
      const subject = 'Sua conta Ateliê Fio & Alma foi aprovada e criada!';
      const text = `
        Olá ${user.email},

        Sua aplicação para o Ateliê Fio & Alma foi aprovada e sua conta criada!
        Você já pode acessar o Espaço do Criador.

        Suas credenciais temporárias são:
        E-mail: ${user.email}
        Senha: ${tempPassword}

        Por segurança, você será solicitado a trocar esta senha no seu primeiro login.
        Acesse: http://localhost:3000/espaco-criador

        Atenciosamente,
        Equipe Ateliê Fio & Alma
      `;
      const html = `
        <p>Olá <strong>${user.email}</strong>,</p>
        <p>Sua aplicação para o Ateliê Fio & Alma foi <strong>aprovada e sua conta criada</strong>!</p>
        <p>Você já pode acessar o Espaço do Criador.</p>
        <p>Suas credenciais temporárias são:</p>
        <ul>
          <li><strong>E-mail:</strong> ${user.email}</li>
          <li><strong>Senha:</strong> <code>${tempPassword}</code></li>
        </ul>
        <p>Por segurança, você será solicitado a trocar esta senha no seu primeiro login.</p>
        <p>Acesse o Espaço do Criador: <a href="http://localhost:3000/espaco-criador">Clique aqui</a></p>
        <p>Atenciosamente,<br>Equipe Ateliê Fio & Alma</p>
      `;
      await sendEmail(user.email, subject, text, html);
      console.log(`Admin: E-mail de aprovação e criação de conta enviado para ${user.email}`);

      return res.status(200).json({ message: 'Aplicação aprovada, usuário criado e e-mail enviado.', user: user });

    } else {
      // Se o usuário já existe, apenas atualizamos o status de aprovação
      if (user.approved) {
        return res.status(400).json({ message: 'Usuário já está aprovado.' });
      }

      user.approved = true;
      user.isFirstLogin = true; // Força a troca de senha mesmo se já existia
      // IMPORTANTE: Se o usuário já existe e não foi criado por essa rota,
      // ele já tem uma senha. NÃO MUDAMOS A SENHA EXISTENTE AQUI,
      // A MENOS QUE QUEIRAMOS FORÇAR UMA NOVA SENHA TEMPORÁRIA.
      // O fluxo atual da rota authRoutes.js/admin/approve-creator JÁ FAZ ISSO.
      // Aqui, vamos apenas aprovar e informar o criador sobre a aprovação.
      // Para enviar uma NOVA senha, precisaríamos gerar aqui e sobrescrever.
      // Vamos manter a lógica simples: aprova e informa.
      await user.save();
      console.log(`Admin: Usuário existente aprovado: ${user.email}`);

      // Atualiza o status da aplicação para aprovado
      application.status = 'aprovado';
      await application.save();

      // Envia e-mail de notificação de aprovação (sem nova senha, pois a senha foi definida no registro)
      const subject = 'Sua conta Ateliê Fio & Alma foi aprovada!';
      const text = `
        Olá ${user.email},

        Sua aplicação foi aprovada! Você já pode acessar o Espaço do Criador com suas credenciais existentes.
        Lembre-se que você será solicitado a trocar sua senha no seu primeiro login.
        Acesse: http://localhost:3000/espaco-criador

        Atenciosamente,
        Equipe Ateliê Fio & Alma
      `;
      const html = `
        <p>Olá <strong>${user.email}</strong>,</p>
        <p>Sua aplicação para o Ateliê Fio & Alma foi <strong>aprovada</strong>!</p>
        <p>Você já pode acessar o Espaço do Criador com suas credenciais existentes.</p>
        <p>Lembre-se que você será solicitado a trocar sua senha no seu primeiro login.</p>
        <p>Acesse o Espaço do Criador: <a href="http://localhost:3000/espaco-criador">Clique aqui</a></p>
        <p>Atenciosamente,<br>Equipe Ateliê Fio & Alma</p>
      `;
      await sendEmail(user.email, subject, text, html);
      console.log(`Admin: E-mail de aprovação enviado para criador existente: ${user.email}`);

      return res.status(200).json({ message: 'Aplicação aprovada e usuário existente atualizado.', user: user });
    }
  } catch (err) {
    console.error('Erro ao aprovar aplicação de criador (Admin):', err);
    res.status(500).json({ message: 'Erro do servidor ao aprovar aplicação de criador', error: err.message });
  }
});

// Rota para rejeitar uma aplicação de criador
router.post('/reject-creator', authMiddleware, authMiddleware.admin, async (req, res) => {
  const { applicationId, reason } = req.body;
  console.log(`Admin: Solicitada rejeição para a aplicação ID: ${applicationId}. Motivo: ${reason}`);

  try {
    const application = await CreatorApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Aplicação não encontrada.' });
    }

    application.status = 'rejeitado';
    await application.save();

    // Opcional: Enviar e-mail de rejeição ao criador
    const user = await User.findOne({ email: application.email });
    if (user) {
      user.approved = false; // Garante que não está aprovado
      user.isFirstLogin = false; // Não é o primeiro login se for rejeitado
      await user.save();
    }

    const subject = 'Status da sua aplicação para o Ateliê Fio & Alma';
    const text = `Olá ${application.email}, infelizmente sua aplicação para o Ateliê Fio & Alma foi rejeitada pelo seguinte motivo: ${reason || 'Não especificado'}.`;
    const html = `<p>Olá <strong>${application.email}</strong>,</p><p>Infelizmente sua aplicação para o Ateliê Fio & Alma foi <strong>rejeitada</strong>.</p><p><strong>Motivo:</strong> ${reason || 'Não especificado'}.</p><p>Atenciosamente,<br>Equipe Ateliê Fio & Alma</p>`;
    await sendEmail(application.email, subject, text, html);
    console.log(`Admin: E-mail de rejeição enviado para ${application.email}`);

    res.status(200).json({ message: 'Aplicação rejeitada com sucesso.', application: application });
  } catch (err) {
    console.error('Erro ao rejeitar aplicação de criador (Admin):', err);
    res.status(500).json({ message: 'Erro do servidor ao rejeitar aplicação de criador', error: err.message });
  }
});

// Rota para obter todos os usuários (criadores e admins)
router.get('/users', authMiddleware, authMiddleware.admin, async (req, res) => {
  try {
    console.log('Admin: Buscando todos os usuários.');
    const users = await User.find({});
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
