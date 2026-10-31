# Documentação técnica do elo

## Visão geral

O elo é uma aplicação web em que o cliente cria uma conta e entra com e-mail e senha. O servidor confere os dados e entrega um token (JWT) que prova que a pessoa está autenticada. As telas foram feitas a partir do design do projeto no Figma.

## Objetivo

Oferecer uma base de acesso para o projeto: cadastro de clientes, login seguro e uma rota protegida que só responde a quem estiver autenticado.

## Principais funcionalidades

- **Criar conta:** nome completo, e-mail e senha (de 8 a 72 caracteres, com letras e números), mais o aceite dos termos. Não é possível cadastrar dois clientes com o mesmo e-mail.
- **Entrar:** e-mail e senha. Com "Manter conectado", o login dura 7 dias; sem marcar, 2 horas.
- **Painel:** tela simples que cumprimenta o cliente e mostra que o token funciona. Tem o botão **Sair**.
- **Mostrar/ocultar senha** nos campos de senha.
- **Responsividade:** o layout se adapta a computador, tablet e celular.

## Tecnologias e ferramentas

| Parte | Tecnologia |
|---|---|
| Servidor | Node.js e Express |
| Banco de dados | MySQL, acessado com `mysql2` |
| Senhas | `bcryptjs` (a senha nunca é salva pura, só o hash) |
| Autenticação | `jsonwebtoken` (JWT) |
| Configuração | `dotenv` (variáveis no arquivo `.env`) |
| Telas | HTML, CSS e JavaScript puro, fonte Inter |

## Estrutura de pastas

```
elo/
├── database/
│   └── schema.sql            criação do banco e da tabela clientes
├── docs/
│   └── DOCUMENTACAO_TECNICA.md
├── public/                   tudo que o navegador acessa
│   ├── index.html            tela Entrar
│   ├── cadastro.html         tela Criar conta
│   ├── painel.html           tela do cliente autenticado
│   ├── css/style.css         estilos de todas as telas
│   ├── img/                  símbolo e ícones (SVG)
│   └── js/
│       ├── comum.js          funções usadas por todas as telas
│       ├── login.js          lógica da tela Entrar
│       ├── cadastro.js       lógica da tela Criar conta
│       └── painel.js         lógica do painel
├── src/                      servidor
│   ├── server.js             inicia o Express e conecta ao banco
│   ├── db.js                 conexão com o MySQL
│   ├── routes/auth.js        cadastro, login e rota protegida
│   └── middleware/auth.js    verificação do JWT
├── .env.example              modelo das variáveis de ambiente
└── package.json
```

## Principais componentes

**Servidor (`src/`)**

- `server.js` valida o `JWT_SECRET`, testa a conexão com o banco, entrega os arquivos da pasta `public` e monta a API em `/api`. Também trata erros e responde sempre em JSON.
- `routes/auth.js` tem as três rotas da API (tabela abaixo) e as regras de validação.
- `middleware/auth.js` lê o cabeçalho `Authorization: Bearer <token>`, confere assinatura e validade e libera ou bloqueia a rota.
- `db.js` cria o pool de conexões com o MySQL.

**Telas (`public/`)**

- `comum.js` guarda o token (`Sessao`), chama a API (`chamarApi`), mostra erros nos campos e alterna a visibilidade da senha.
- `login.js`, `cadastro.js` e `painel.js` cuidam de cada tela.

### Rotas da API

| Método e rota | O que faz | Protegida |
|---|---|---|
| `POST /api/clientes` | Cria um cliente | Não |
| `POST /api/auth/login` | Confere e-mail e senha e devolve o JWT | Não |
| `GET /api/auth/me` | Devolve os dados do cliente do token | Sim |

## Funcionamento geral

1. No cadastro, o navegador valida os campos e envia para `POST /api/clientes`. O servidor valida de novo, gera o hash da senha e grava no banco.
2. No login, o servidor busca o cliente pelo e-mail e compara a senha com o hash. Se estiver certo, assina um JWT com o `JWT_SECRET` e devolve.
3. O navegador guarda o token: no `localStorage` se "Manter conectado" estiver marcado, ou no `sessionStorage` caso contrário.
4. O painel envia o token em `GET /api/auth/me`. Se o token for inválido ou tiver expirado, o cliente volta para a tela de login.
5. Ao sair, o token é apagado do navegador.

Cuidados de segurança já implementados: senhas com hash, mensagem única para login errado ("E-mail ou senha incorretos"), mesmo tempo de resposta para e-mail existente ou não, limite de tamanho nos campos e segredos fora do código.

## Instalação e execução

Requisitos: Node.js 18.11 ou superior e MySQL (ou MariaDB).

1. `npm install`
2. `mysql -u root -p < database/schema.sql`
3. Copie `.env.example` para `.env`, preencha os dados do banco e gere o `JWT_SECRET` com o comando indicado no próprio arquivo.
4. `npm start` e acesse http://localhost:3000

## Pendências

- **Envio de e-mail (SMTP):** ainda não implementado. "Esqueceu a senha?" depende dele.
- **Entrar com Google:** o botão existe no design, mas ainda não funciona.
- **Termos de Uso e Política de Privacidade:** os links existem, mas as páginas ainda não foram criadas.
- **Limite de tentativas de login:** ainda não há proteção contra tentativas repetidas de senha.
