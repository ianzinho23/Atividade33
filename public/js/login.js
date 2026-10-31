const formulario = document.getElementById('form-login');
const botao = document.getElementById('botao-entrar');

if (Sessao.token()) location.replace('painel.html');

if (new URLSearchParams(location.search).get('cadastro') === 'ok') {
  document.getElementById('aviso-sucesso').hidden = false;
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const manter = document.getElementById('manter').checked;

  if (!REGEX_EMAIL.test(email)) mostrarErroCampo('email', 'Informe um e-mail válido.');
  if (senha === '') mostrarErroCampo('senha', 'Digite sua senha.');
  if (formulario.querySelector('.invalido')) return;

  botao.disabled = true;
  const { ok, dados } = await chamarApi('/auth/login', {
    metodo: 'POST',
    corpo: { email, senha, manterConectado: manter },
  });
  botao.disabled = false;

  if (!ok) return mostrarAlerta(dados.erro || 'Não foi possível entrar.');

  Sessao.salvar(dados.token, manter);
  location.href = 'painel.html';
});
