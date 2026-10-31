# elo

Aplicação web com telas de **Entrar** e **Criar conta**, cadastro de clientes e autenticação com JWT.

## Tecnologias

- Node.js e Express
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`) e `bcryptjs`
- HTML, CSS e JavaScript puro no front-end

## Funcionalidades

- Cadastro de cliente com nome, e-mail e senha
- Login com e-mail e senha, com opção "Manter conectado"
- Rota protegida por JWT e painel simples para o cliente autenticado
- Telas responsivas (computador, tablet e celular)

## Requisitos

- Node.js 18.11 ou superior
- MySQL (ou MariaDB)

## Instalação e configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o banco e a tabela:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. Crie o arquivo `.env` a partir do exemplo e preencha os dados do seu MySQL:

   ```bash
   cp .env.example .env
   ```

4. Gere um segredo para o JWT e coloque em `JWT_SECRET` no `.env`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

## Como executar

```bash
npm start
```

Acesse http://localhost:3000. Para reiniciar o servidor automaticamente durante o desenvolvimento, use `npm run dev`.

## Documentação

Veja a [documentação técnica](docs/DOCUMENTACAO_TECNICA.md).
