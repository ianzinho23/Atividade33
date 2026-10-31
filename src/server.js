require('dotenv').config();
const path = require('path');
const express = require('express');
const pool = require('./db');
const authRoutes = require('./routes/auth');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('Defina JWT_SECRET (mínimo de 16 caracteres) no arquivo .env');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
}));
app.use('/api', authRoutes);
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// eslint-disable-next-line no-unused-vars
app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Requisição inválida.' });
  if (erro.type === 'entity.too.large') return res.status(413).json({ erro: 'Requisição grande demais.' });
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const porta = process.env.PORT || 3000;

pool.query('SELECT 1')
  .then(() => app.listen(porta, () => console.log(`elo rodando em http://localhost:${porta}`)))
  .catch((erro) => {
    console.error('Não foi possível conectar ao MySQL:', erro.message);
    process.exit(1);
  });
