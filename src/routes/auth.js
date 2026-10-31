const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const exigirAutenticacao = require('../middleware/auth');

const router = express.Router();

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITE_NOME = 120;
const LIMITE_EMAIL = 160;
const LIMITE_SENHA_BYTES = 72; // o bcrypt ignora o que passa disso
const DURACAO_TOKEN = { curta: '2h', longa: '7d' };

// Comparado quando o e-mail não existe, para o login demorar o mesmo nos dois casos
const HASH_FALSO = bcrypt.hashSync('senha-falsa', 10);

function senhaValida(senha) {
  return typeof senha === 'string'
    && senha.length >= 8
    && Buffer.byteLength(senha) <= LIMITE_SENHA_BYTES
    && /[A-Za-z]/.test(senha)
    && /\d/.test(senha);
}

function validarCadastro({ nome, email, senha, aceitouTermos }) {
  const erros = {};
  const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
  const emailLimpo = typeof email === 'string' ? email.trim() : '';

  if (nomeLimpo.length < 3) erros.nome = 'Informe seu nome completo.';
  else if (nomeLimpo.length > LIMITE_NOME) erros.nome = `O nome deve ter no máximo ${LIMITE_NOME} caracteres.`;
  if (emailLimpo.length > LIMITE_EMAIL || !REGEX_EMAIL.test(emailLimpo)) erros.email = 'Informe um e-mail válido.';
  if (!senhaValida(senha)) erros.senha = 'A senha deve ter de 8 a 72 caracteres, com letras e números.';
  if (aceitouTermos !== true) erros.termos = 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.';

  return erros;
}

router.post('/clientes', async (req, res) => {
  const corpo = req.body || {};
  const erros = validarCadastro(corpo);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({ erro: 'Confira os campos informados.', campos: erros });
  }

  try {
    const senhaHash = await bcrypt.hash(corpo.senha, 10);
    const [resultado] = await pool.execute(
      'INSERT INTO clientes (nome, email, senha_hash) VALUES (?, ?, ?)',
      [corpo.nome.trim(), corpo.email.trim().toLowerCase(), senhaHash]
    );
    res.status(201).json({ id: resultado.insertId, mensagem: 'Conta criada com sucesso!' });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        erro: 'Já existe uma conta com esse e-mail.',
        campos: { email: 'Já existe uma conta com esse e-mail.' },
      });
    }
    console.error('Erro ao cadastrar cliente:', erro);
    res.status(500).json({ erro: 'Não foi possível criar a conta agora. Tente novamente.' });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, senha, manterConectado } = req.body || {};

  if (typeof email !== 'string' || !REGEX_EMAIL.test(email.trim()) || typeof senha !== 'string' || senha === '') {
    return res.status(400).json({ erro: 'Informe seu e-mail e sua senha.' });
  }

  try {
    const [[cliente]] = await pool.execute(
      'SELECT id, nome, email, senha_hash FROM clientes WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    const senhaConfere = await bcrypt.compare(senha, cliente ? cliente.senha_hash : HASH_FALSO);
    if (!cliente || !senhaConfere) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { sub: cliente.id, email: cliente.email },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: manterConectado === true ? DURACAO_TOKEN.longa : DURACAO_TOKEN.curta }
    );

    res.json({ token, cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email } });
  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({ erro: 'Não foi possível entrar agora. Tente novamente.' });
  }
});

router.get('/auth/me', exigirAutenticacao, async (req, res) => {
  try {
    const [[cliente]] = await pool.execute('SELECT id, nome, email FROM clientes WHERE id = ?', [req.clienteId]);
    if (!cliente) return res.status(401).json({ erro: 'Conta não encontrada.' });
    res.json({ cliente });
  } catch (erro) {
    console.error('Erro em /auth/me:', erro);
    res.status(500).json({ erro: 'Erro ao buscar seus dados.' });
  }
});

module.exports = router;
