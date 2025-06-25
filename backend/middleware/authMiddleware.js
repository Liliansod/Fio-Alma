const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT e autenticar o usuário
module.exports = function(req, res, next) {
  // Obter o token do cabeçalho da requisição
  const token = req.header('x-auth-token'); // Ou 'Authorization' se preferir `Bearer <token>`

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ message: 'Nenhum token, autorização negada.' });
  }

  try {
    // Verificar o token
    // Se o token estiver no formato "Bearer <token>", você precisa splitá-lo
    let tokenToVerify = token;
    if (token.startsWith('Bearer ')) {
      tokenToVerify = token.slice(7, token.length);
    }
    const decoded = jwt.verify(tokenToVerify, process.env.JWT_SECRET); // Decodifica o token usando a chave secreta

    // Anexar o usuário do token decodificado ao objeto de requisição
    req.user = decoded.user;
    next(); // Passa para o próximo middleware/rota
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};
