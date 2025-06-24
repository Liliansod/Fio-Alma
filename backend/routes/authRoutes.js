const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService'); // Importa o serviço de e-mail
const authMiddleware = require('../middleware/authMiddleware'); // Middleware para proteger rotas (se necessário)

// Função auxiliar para gerar senhas aleatórias
function generateRandomPassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Rota para registro de novo usuário
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Usuário com este e-mail já existe.' });
    }

    user = new User({
      email,
      password,
      // approved: false e isFirstLogin: true são os defaults no modelo User.js
    });

    await user.save();

    // --- NOVO: ENVIAR E-MAIL DE NOTIFICAÇÃO PARA A EQUIPE DO ATELIÊ ---
    const equipeEmail = 'ateliefioealma@gmail.com'; // E-mail da sua equipe
    const subject = `Nova Solicitação de Cadastro de Criador: ${email}`;
    const text = `
      Um novo criador se cadastrou no Ateliê Fio & Alma:

      E-mail do Criador: ${email}
      ID do Criador (para aprovação): ${user._id}

      Por favor, acesse o painel de administração (ou utilize a rota de aprovação manual para testes) para revisar e aprovar este criador.
      Lembre-se de gerar uma senha temporária e enviá-la ao criador após a aprovação.
    `;
    const html = `
      <p>Um novo criador se cadastrou no Ateliê Fio & Alma:</p>
      <ul>
        <li><strong>E-mail do Criador:</strong> ${email}</li>
        <li><strong>ID do Criador (para aprovação):</strong> ${user._id}</li>
      </ul>
      <p>Por favor, acesse o painel de administração (ou utilize a rota de aprovação manual para testes) para revisar e aprovar este criador.</p>
      <p>Lembre-se de <strong>gerar uma senha temporária e enviá-la ao criador</strong> (via a rota de aprovação) após a aprovação.</p>
    `;

    await sendEmail(equipeEmail, subject, text, html);
    console.log(`E-mail de notificação de novo cadastro enviado para ${equipeEmail}`);
    // --- FIM DO NOVO BLOCO DE E-MAIL ---


    res.status(201).json({
      message: 'Registro realizado com sucesso! Aguarde a aprovação da equipe para acessar o Espaço do Criador.',
      user: { id: user.id, email: user.email, approved: user.approved }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro do servidor ao registrar usuário.');
  }
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    if (!user.approved) {
      return res.status(403).json({ message: 'Sua conta ainda não foi aprovada pela equipe. Aguarde a aprovação.' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        approved: user.approved,
        isFirstLogin: user.isFirstLogin // Inclui a flag no payload do JWT
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Login bem-sucedido',
          token,
          user: { id: user.id, email: user.email, role: user.role, approved: user.approved, isFirstLogin: user.isFirstLogin }
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro do servidor ao fazer login.');
  }
});

// --- Rota de ADMINISTRAÇÃO para Aprovar Criador (Para TESTES - Proteja em Produção!) ---
router.post('/admin/approve-creator', async (req, res) => {
  const { userId } = req.body; // ID do usuário a ser aprovado

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (user.approved) {
      return res.status(400).json({ message: 'Usuário já está aprovado.' });
    }

    // 1. Aprova o usuário
    user.approved = true;
    user.isFirstLogin = true; // Garante que, ao ser aprovado, será o primeiro login

    // 2. Gera uma senha temporária
    const tempPassword = generateRandomPassword();
    user.password = tempPassword; // O middleware pre-save hasheará essa senha

    await user.save(); // Salva as mudanças no banco de dados

    // 3. ENVIAR E-MAIL PARA O CRIADOR COM AS CREDENCIAIS TEMPORÁRIAS
    const subject = 'Sua conta Ateliê Fio & Alma foi aprovada!';
    const text = `
      Olá ${user.email},

      Sua aplicação para o Ateliê Fio & Alma foi aprovada!
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
      <p>Sua aplicação para o Ateliê Fio & Alma foi <strong>aprovada</strong>!</p>
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
    console.log(`E-mail de aprovação enviado para ${user.email}`);

    res.status(200).json({ message: 'Criador aprovado e e-mail enviado com sucesso.', user: user });

  } catch (err) {
    console.error('Erro ao aprovar criador:', err);
    res.status(500).json({ message: 'Erro do servidor ao aprovar criador', error: err.message });
  }
});

// --- Rota para Rejeitar Criador (Opcional - Proteja em Produção!) ---
router.post('/admin/reject-creator', async (req, res) => {
  const { userId, reason } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    user.approved = false; // Garante que não está aprovado
    user.isFirstLogin = false; // Não é o primeiro login se for rejeitado
    await user.save();

    // Opcional: Enviar e-mail de rejeição ao criador com o motivo
    const subject = 'Status da sua aplicação para o Ateliê Fio & Alma';
    const text = `Olá ${user.email}, infelizmente sua aplicação foi rejeitada pelo seguinte motivo: ${reason || 'Não especificado'}.`;
    const html = `<p>Olá <strong>${user.email}</strong>,</p><p>Infelizmente sua aplicação para o Ateliê Fio & Alma foi <strong>rejeitada</strong>.</p><p><strong>Motivo:</strong> ${reason || 'Não especificado'}.</p><p>Atenciosamente,<br>Equipe Ateliê Fio & Alma</p>`;
    await sendEmail(user.email, subject, text, html);
    console.log(`E-mail de rejeição enviado para ${user.email}`);

    res.status(200).json({ message: 'Criador rejeitado e e-mail enviado com sucesso.', user: user });
  } catch (err) {
    console.error('Erro ao rejeitar criador:', err);
    res.status(500).json({ message: 'Erro do servidor ao rejeitar criador', error: err.message });
  }
});


// --- Rota para Troca de Senha Após Primeiro Login ---
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id); // req.user.id vem do JWT decodificado
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica a senha atual se não for o primeiro login
    if (!user.isFirstLogin) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Senha atual incorreta.' });
      }
    }

    // Verifica se a nova senha é forte o suficiente ou atende a requisitos
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    user.password = newPassword; // A senha será hasheada pelo middleware pre-save
    user.isFirstLogin = false; // Marca como não sendo o primeiro login
    await user.save();

    res.status(200).json({ message: 'Senha alterada com sucesso!', isFirstLogin: false });

  } catch (err) {
    console.error('Erro ao trocar senha:', err);
    res.status(500).send('Erro do servidor ao trocar senha.');
  }
});


// Rota para solicitar redefinição de senha
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // É uma boa prática não informar se o e-mail existe ou não por questões de segurança.
      return res.status(200).json({ message: 'Se o e-mail estiver registrado, um link para redefinição de senha será enviado.' });
    }

    console.log(`[Placeholder] Solicitação de recuperação de senha para: ${email}. Um link seria enviado.`);
    res.status(200).json({ message: 'Se o e-mail estiver registrado, um link para redefinição de senha será enviado.' });

  } catch (err) {
    console.error('Erro ao solicitar recuperação de senha:', err);
    res.status(500).send('Erro do servidor ao solicitar recuperação de senha.');
  }
});

// Rota para redefinir a senha (recebe o token e a nova senha)
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    console.log(`[Placeholder] Redefinir senha com token: ${token} para nova senha: ${newPassword}`);

    res.status(200).json({ message: 'Senha redefinida com sucesso!' });

  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).send('Erro do servidor ao redefinir senha.');
  }
});

module.exports = router;
