const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT e autenticar o usuário
// Adicionado suporte para verificar a função (role) do usuário
module.exports = function(req, res, next) {
  // Obter o token do cabeçalho da requisição
  const token = req.header('x-auth-token'); // Ou 'Authorization' se preferir `Bearer <token>`

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ message: 'Nenhum token fornecido, autorização negada.' });
  }

  try {
    // Verificar o token
    let tokenToVerify = token;
    if (token.startsWith('Bearer ')) {
      tokenToVerify = token.slice(7, token.length); // Remove 'Bearer ' prefix
    }
    const decoded = jwt.verify(tokenToVerify, process.env.JWT_SECRET); // Decodifica o token usando a chave secreta

    // Anexar o usuário do token decodificado ao objeto de requisição
    // O payload do JWT agora inclui user.role e user.approved
    req.user = decoded.user;
    next(); // Passa para o próximo middleware/rota
  } catch (err) {
    console.error('Falha na verificação do token:', err);
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

// NOVO: Middleware para verificar se o usuário é um administrador
module.exports.admin = function(req, res, next) {
  // Assume que req.user já foi definido pelo middleware de autenticação anterior
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
  }
  next(); // Se for admin, passa para o próximo
};
