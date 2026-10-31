const jwt = require('jsonwebtoken');

function exigirAutenticacao(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Você precisa entrar na sua conta.' });
  }

  try {
    const { sub } = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.clienteId = sub;
    next();
  } catch {
    res.status(401).json({ erro: 'Sua sessão expirou. Entre novamente.' });
  }
}

module.exports = exigirAutenticacao;
