document.getElementById('sair').addEventListener('click', () => {
  Sessao.limpar();
  location.replace('index.html');
});

(async function carregarCliente() {
  if (!Sessao.token()) return location.replace('index.html');

  const { ok, dados } = await chamarApi('/auth/me', { autenticado: true });
  if (!ok) {
    Sessao.limpar();
    return location.replace('index.html');
  }

  document.getElementById('saudacao').textContent = `Olá, ${dados.cliente.nome.split(' ')[0]}.`;
  document.getElementById('detalhe').textContent = `Você entrou como ${dados.cliente.email}.`;
})();
