const formulario = document.getElementById('form-cadastro');
const botao = document.getElementById('botao-cadastrar');

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const aceitouTermos = document.getElementById('termos').checked;

  if (nome.length < 3) mostrarErroCampo('nome', 'Informe seu nome completo.');
  if (!REGEX_EMAIL.test(email)) mostrarErroCampo('email', 'Informe um e-mail válido.');
  if (!senhaForte(senha)) mostrarErroCampo('senha', 'A senha deve ter de 8 a 72 caracteres, com letras e números.');
  if (!aceitouTermos) mostrarErroCampo('termos', 'Você precisa aceitar os termos para continuar.');
  if (formulario.querySelector('.invalido')) return;

  botao.disabled = true;
  const { ok, dados } = await chamarApi('/clientes', {
    metodo: 'POST',
    corpo: { nome, email, senha, aceitouTermos },
  });
  botao.disabled = false;

  if (!ok) {
    if (dados.campos) Object.entries(dados.campos).forEach(([campo, mensagem]) => mostrarErroCampo(campo, mensagem));
    else mostrarAlerta(dados.erro || 'Não foi possível criar a conta.');
    return;
  }

  location.href = 'index.html?cadastro=ok';
});
