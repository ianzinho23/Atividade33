const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Manter conectado" guarda o token no localStorage; sem marcar, só dura a aba (sessionStorage)
const Sessao = {
  salvar(token, manter) {
    this.limpar();
    (manter ? localStorage : sessionStorage).setItem('elo_token', token);
  },
  token() {
    return localStorage.getItem('elo_token') || sessionStorage.getItem('elo_token');
  },
  limpar() {
    localStorage.removeItem('elo_token');
    sessionStorage.removeItem('elo_token');
  },
};

async function chamarApi(caminho, { metodo = 'GET', corpo, autenticado = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (autenticado && Sessao.token()) headers.Authorization = `Bearer ${Sessao.token()}`;

  try {
    const resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers,
      body: corpo && JSON.stringify(corpo),
    });
    const dados = await resposta.json().catch(() => ({}));
    return { ok: resposta.ok, dados };
  } catch {
    return { ok: false, dados: { erro: 'Sem conexão com o servidor. Tente novamente.' } };
  }
}

function senhaForte(senha) {
  return senha.length >= 8
    && new TextEncoder().encode(senha).length <= 72
    && /[A-Za-z]/.test(senha)
    && /\d/.test(senha);
}

function mostrarErroCampo(nome, mensagem) {
  const campo = document.querySelector(`[data-campo="${nome}"]`);
  if (!campo) return;
  campo.classList.add('invalido');
  campo.querySelector('input')?.setAttribute('aria-invalid', 'true');
  document.getElementById(`erro-${nome}`).textContent = mensagem;
}

function limparErros() {
  document.querySelectorAll('.campo.invalido').forEach((campo) => {
    campo.classList.remove('invalido');
    campo.querySelector('input')?.removeAttribute('aria-invalid');
  });
  document.querySelectorAll('.erro-campo').forEach((erro) => { erro.textContent = ''; });

  const alerta = document.getElementById('alerta-form');
  if (alerta) {
    alerta.hidden = true;
    alerta.textContent = '';
  }
}

function mostrarAlerta(mensagem) {
  const alerta = document.getElementById('alerta-form');
  alerta.textContent = mensagem;
  alerta.hidden = false;
}

document.querySelectorAll('[data-alternar-senha]').forEach((botao) => {
  botao.addEventListener('click', () => {
    const input = document.getElementById(botao.dataset.alternarSenha);
    const estavaVisivel = input.type === 'text';
    input.type = estavaVisivel ? 'password' : 'text';
    botao.querySelector('img').src = estavaVisivel ? 'img/olho-fechado.svg' : 'img/olho.svg';
    botao.setAttribute('aria-label', estavaVisivel ? 'Mostrar senha' : 'Ocultar senha');
  });
});

document.querySelectorAll('[data-em-breve]').forEach((elemento) => {
  elemento.addEventListener('click', (evento) => {
    evento.preventDefault();
    alert('Este recurso ainda não está disponível.');
  });
});
