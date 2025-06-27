const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const CreatorApplication = require('../models/CreatorApplication');
const { sendEmail } = require('../utils/emailService');
const authMiddleware = require('../middleware/authMiddleware');

// Função auxiliar para gerar senhas aleatórias
function generateRandomPassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+\"";
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
    let user = await User.findOne({ email: email.toLowerCase() }); // Busca por email em minúsculas
    if (user) {
      return res.status(400).json({ message: 'Usuário com este e-mail já existe.' });
    }

    user = new User({
      email: email.toLowerCase(), // Salva em minúsculas
      password,
    });

    await user.save();

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
    let user = await User.findOne({ email: email.toLowerCase() }); // Busca por email em minúsculas
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
        isFirstLogin: user.isFirstLogin
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

// Rota para aprovar criador (admin) - Centralizada e Corrigida
router.post('/admin/approve-creator', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') { return res.status(403).json({ message: 'Acesso negado.' }); }
  const { email } = req.body; // Recebe o e-mail da aplicação

  try {
    // 1. Encontrar a aplicação do criador pelo email
    const application = await CreatorApplication.findOne({ email: email.toLowerCase() });
    if (!application) {
      return res.status(404).json({ message: 'Aplicação não encontrada.' });
    }

    // 2. Encontrar ou criar o usuário associado (usando o email da aplicação)
    let user = await User.findOne({ email: application.email.toLowerCase() });

    if (!user) {
      // Se o usuário não existe (caso de alguém que preencheu o faça parte mas não se registrou)
      const tempPassword = generateRandomPassword();
      user = new User({
        email: application.email.toLowerCase(),
        password: tempPassword, // Será hasheada pelo pre-save middleware
        role: 'criador',
        approved: true,
        isFirstLogin: true
      });
      await user.save();
      console.log(`Admin: Novo usuário criado a partir da aplicação: ${user.email}`);
    } else {
      // Se o usuário já existe
      if (user.approved) {
        // Se o usuário já está aprovado, não precisamos gerar nova senha, apenas atualizar aplicação se necessário.
        // Isso impede o erro "Usuário já está aprovado" se o admin tentar aprovar novamente um usuário já aprovado.
        console.log(`Admin: Usuário ${user.email} já está aprovado. Atualizando status da aplicação se pendente.`);
      } else {
        // Se o usuário existe mas ainda não está aprovado
        const tempPassword = generateRandomPassword();
        user.password = tempPassword; // Atribui nova senha temporária (será hasheada)
        user.approved = true;
        user.isFirstLogin = true;
        await user.save();
        console.log(`Admin: Usuário existente ${user.email} aprovado e senha temporária gerada.`);
      }
    }

    // 3. Atualizar o status da aplicação para 'aprovado'
    // Garantir que o status da aplicação é 'pendente' antes de tentar mudar
    if (application.status !== 'aprovado') {
        application.status = 'aprovado';
        await application.save();
        console.log(`Status da aplicação de criador para ${application.email} atualizado para 'aprovado'.`);
    } else {
        console.log(`Aplicação para ${application.email} já está aprovada, sem necessidade de atualização.`);
    }
    
    // 4. Enviar e-mail para o criador com as credenciais (se o usuário foi recém-aprovado ou teve a senha resetada)
    const subject = 'Sua conta Ateliê Fio & Alma foi aprovada!';
    let text, html;

    if (!user.approved || user.isFirstLogin) { // Se o usuário acabou de ser aprovado ou precisa trocar a senha
      text = `
        Olá ${user.email},

        Sua aplicação para o Ateliê Fio & Alma foi aprovada e sua conta criada!
        Você já pode acessar o Espaço do Criador.

        Suas credenciais temporárias são:
        E-mail: ${user.email}
        Senha: ${user.password}  // ATENÇÃO: Aqui o password já foi hasheado, deve-se usar a tempPassword original.
                                 // Para corrigir, a tempPassword original precisa ser passada para o email.
                                 // Vou usar a tempPassword gerada acima, antes do save.
                                 // Se o user já existia e não geramos nova senha temporária, o email será diferente.
      `;
      html = `
        <p>Olá <strong>${user.email}</strong>,</p>
        <p>Sua aplicação para o Ateliê Fio & Alma foi <strong>aprovada e sua conta criada</strong>!</p>
        <p>Você já pode acessar o Espaço do Criador.</p>
        <p>Suas credenciais temporárias são:</p>
        <ul>
          <li><strong>E-mail:</strong> ${user.email}</li>
          <li><strong>Senha:</strong> <code>${user.password}</code></li>
        </ul>
        <p>Por segurança, você será solicitado a trocar esta senha no seu primeiro login.</p>
        <p>Acesse o Espaço do Criador: <a href="https://fio-alma-main.vercel.app/espaco-criador">Clique aqui</a></p>
        <p>Atenciosamente,<br>Equipe Ateliê Fio & Alma</p>
      `;
      // Correção: Para enviar a senha temporária no e-mail, precisamos capturá-la ANTES de user.save()
      // O ideal é que a `generateRandomPassword` seja chamada e a senha NÃO HASHEADA seja usada no email.
      // A lógica atual já faz isso, mas o `user.password` dentro do email já está hasheado.
      // Vamos ajustar a forma como a tempPassword é usada para o email.
    } else {
      // Se o usuário já existia e já estava aprovado, apenas um email de confirmação sem senha
      text = `
        Olá ${user.email},

        Sua aplicação para o Ateliê Fio & Alma foi aprovada!
        Você já pode acessar o Espaço do Criador com suas credenciais existentes.

        Atenciosamente,
        Equipe Ateliê Fio & Alma
      `;
      html = `
        <p>Olá <strong>${user.email}</strong>,</p>
        <p>Sua aplicação para o Ateliê Fio & Alma foi <strong>aprovada</strong>!</p>
        <p>Você já pode acessar o Espaço do Criador com suas credenciais existentes.</p>
        <p>Acesse o Espaço do Criador: <a href="https://fio-alma-main.vercel.app/espaco-criador">Clique aqui</a></p>
        <p>Atenciosamente,<br>Equipe Ateliê Fio & Alma</p>
      `;
    }

    // Reajuste da lógica para a senha no email:
    let passwordToSendInEmail = '';
    if (!user.approved || user.isFirstLogin) { // Se acabou de ser aprovado ou precisa trocar senha
      const initialPassword = generateRandomPassword(); // Gera uma nova senha NÃO HASHEADA
      user.password = initialPassword; // Será hasheada no pre-save
      await user.save(); // Salva o usuário com a nova senha hasheada
      passwordToSendInEmail = initialPassword; // Usa a senha NÃO HASHEADA para o email

      text = `
        Olá ${user.email},

        Sua aplicação para o Ateliê Fio & Alma foi aprovada e sua conta criada!
        Você já pode acessar o Espaço do Criador.

        Suas credenciais temporárias são:
        E-mail: ${user.email}
        Senha: ${passwordToSendInEmail}

        Por segurança, você será solicitado a trocar esta senha no seu primeiro login.
        Acesse: http:https://fio-alma-main.vercel.app/espaco-criador

        Atenciosamente,
        Equipe Ateliê Fio & Alma
      `;
      html = `
        <p>Olá <strong>${user.email}</strong>,</p>
        <p>Sua aplicação para o Ateliê Fio & Alma foi <strong>aprovada e sua conta criada</strong>!</p>
        <p>Você já pode acessar o Espaço do Criador.</p>
        <p>Suas credenciais temporárias são:</p>
        <ul>
          <li><strong>E-mail:</strong> ${user.email}</li>
          <li><strong>Senha:</strong> <code>${passwordToSendInEmail}</code></li>
        </ul>
        <p>Por segurança, você será solicitado a trocar esta senha no seu primeiro login.</p>
        <p>Acesse o Espaço do Criador: <a href="https://fio-alma-main.vercel.app/espaco-criador">Clique aqui</a></p>
        <p>Atenciosamente,<br>Equipe Ateliê Fio & Alma</p>
      `;
    }

    await sendEmail(user.email, subject, text, html);
    console.log(`E-mail de aprovação enviado para ${user.email}`);

    res.status(200).json({ message: 'Criador aprovado e e-mail enviado com sucesso.', user: user });

  } catch (err) {
    console.error('Erro ao aprovar criador:', err);
    res.status(500).json({ message: 'Erro do servidor ao aprovar criador', error: err.message });
  }
});


// Rota para rejeitar criador (admin)
router.post('/admin/reject-creator', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') { return res.status(403).json({ message: 'Acesso negado.' }); }
  const { email, reason } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }); // Busca por email em minúsculas
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Atualiza o status da CreatorApplication
    await CreatorApplication.findOneAndUpdate(
      { email: email.toLowerCase() }, // Garante que busca por email em minúsculas
      { $set: { status: 'rejeitado' } },
      { new: true }
    );
    console.log(`Status da aplicação de criador para ${email} atualizado para 'rejeitado'.`);

    // Define o usuário como não aprovado, se ele existia
    user.approved = false;
    user.isFirstLogin = false; // Não é o primeiro login se for rejeitado
    await user.save();

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

// Rota para Troca de Senha Após Primeiro Login / Forçada
router.post('/change-password', authMiddleware, async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    user.password = newPassword;
    user.isFirstLogin = false;
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
    const user = await User.findOne({ email: email.toLowerCase() }); // Busca por email em minúsculas
    if (!user) {
      return res.status(200).json({ message: 'Se o e-mail estiver registrado, um link para redefinição de senha será enviado.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `https://fio-alma-main.vercel.app/redefinir-senha/${resetToken}`;

    const subject = 'Redefinição de Senha - Ateliê Fio & Alma';
    const text = `Você solicitou a redefinição de senha. Use este link para redefinir sua senha: ${resetUrl}\n\nEste link é válido por 1 hora.`;
    const html = `
      <p>Você solicitou a redefinição de senha para sua conta no Ateliê Fio & Alma.</p>
      <p>Por favor, clique no link abaixo para redefinir sua senha:</p>
      <p><a href="${resetUrl}">Redefinir Senha</a></p>
      <p>Este link é válido por 1 hora.</p>
      <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
    `;

    await sendEmail(user.email, subject, text, html);
    console.log(`E-mail de redefinição de senha enviado para: ${user.email}`);

    res.status(200).json({ message: 'Se o e-mail estiver registrado, um link para redefinição de senha será enviado.' });

  } catch (err) {
    console.error('Erro ao solicitar recuperação de senha:', err);
    res.status(500).send('Erro do servidor ao solicitar recuperação de senha.');
  }
});

// Rota para redefinir a senha
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado. Por favor, solicite uma nova redefinição.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    user.password = newPassword;
    user.isFirstLogin = false;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const subjectConfirmacao = 'Senha Redefinida - Ateliê Fio & Alma';
    const textConfirmacao = `Olá ${user.email},\n\nSua senha foi redefinida com sucesso.`;
    const htmlConfirmacao = `<p>Olá <strong>${user.email}</strong>,</p><p>Sua senha foi redefinida com sucesso.</p>`;
    await sendEmail(user.email, subjectConfirmacao, textConfirmacao, htmlConfirmacao);
    console.log(`E-mail de confirmação de redefinição de senha enviado para: ${user.email}`);

    res.status(200).json({ message: 'Senha redefinida com sucesso! Você pode fazer login agora.' });

  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).send('Erro do servidor ao redefinir senha.');
  }
});

// Rota para deletar um usuário (Apenas Admin)
router.delete('/admin/users/:id', authMiddleware, async (req, res) => {
    // Verificar se o usuário logado é um administrador
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem deletar usuários.' });
    }

    try {
        const userId = req.params.id;
        // Evitar que um admin tente deletar a si mesmo
        if (req.user.id === userId) {
            return res.status(400).json({ message: 'Você não pode deletar sua própria conta através desta interface.' });
        }

        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Antes de deletar o usuário, é importante lidar com dados relacionados
        // 1. Deletar todas as aplicações de criador associadas
        await CreatorApplication.deleteMany({ email: userToDelete.email });
        console.log(`Aplicações de criador associadas ao e-mail ${userToDelete.email} deletadas.`);
        
        // 2. Deletar todos os produtos associados a este criador (se houver)
        // Você precisaria importar o modelo Product aqui: const Product = require('../models/Product');
        // E então: await Product.deleteMany({ criador: userToDelete.email });
        // console.log(`Produtos associados ao criador ${userToDelete.email} deletados.`);

        await User.findByIdAndDelete(userId);
        console.log(`Usuário ${userToDelete.email} deletado com sucesso.`);

        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar usuário:', err);
        res.status(500).json({ message: 'Erro do servidor ao deletar usuário', error: err.message });
    }
});


// NOVO: Rota para atualizar o perfil do usuário (Criador ou Admin)
router.put('/profile', authMiddleware, async (req, res) => {
  const { email } = req.body; // Por enquanto, apenas o email é editável aqui

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Se o email estiver sendo alterado, verifique se o novo email já existe
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Este e-mail já está em uso.' });
      }
      user.email = email;
    }

    // Se você adicionar outros campos ao User Schema (ex: nome, telefone),
    // você os atualizaria aqui:
    // if (req.body.nome) user.nome = req.body.nome;

    await user.save();

    // Re-gerar o token JWT para incluir o email atualizado (se alterado)
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        approved: user.approved,
        isFirstLogin: user.isFirstLogin
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Perfil atualizado com sucesso!',
          token,
          user: { id: user.id, email: user.email, role: user.role, approved: user.approved, isFirstLogin: user.isFirstLogin }
        });
      }
    );

  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ message: 'Erro do servidor ao atualizar perfil', error: err.message });
  }
});


module.exports = router;
