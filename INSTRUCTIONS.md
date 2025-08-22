# INSTRUÇÕES PARA CONFIGURAÇÃO DO PROJETO

## 1. Crie um arquivo `.env` na raiz com:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=policia_db
JWT_SECRET=seu_super_segredo_jwt_aqui_muito_longo_e_complexo
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

## 2. Instale as dependências:

```bash
npm install
```

## 3. Subir o banco com Docker:

```bash
docker-compose up -d
```

## 4. Rodar as migrations:

```bash
npx knex migrate:latest
```

## 5. Rodar os seeds:

```bash
npm run seed:run
```

## 6. Iniciar o servidor:

```bash
npm start
```

## 7. Acessar a aplicação:

- API: http://localhost:3000
- Docs: http://localhost:3000/docs

## 8. Reset completo do banco de dados:

```bash
npm run db:reset
```

# AUTENTICAÇÃO E SEGURANÇA

## Registro de usuário

### Endpoint: POST /auth/register

Body (JSON):

```bash
{
    "nome": "Matheus",
    "email": "matheus@example.com",
    "senha": "Senha@123"
}
```

Resposta (201):

```bash
{
    "status": 201,
    "message": "Usuário criado com sucesso",
    "data": {
        "id": 1,
        "nome": "Matheus",
        "email": "matheus@example.com",
        "created_at": "2025-08-21T12:00:00Z"
    }
}
```

Requisitos da senha:

- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial

## Login de usuário

### Endpoint: POST /auth/login

Body (JSON):

```bash
{
    "email": "matheus@example.com",
    "senha": "Senha@123"
}
```

Resposta (200):

```bash
{
    "access_token": "jwt_token"
}
```

## Envio do token JWT

### As rotas protegidas exigem que o token seja enviado no cabeçalho Authorization no formato:

```bash
Authorization: Bearer <seu_jwt_token>
```

Exemplo com curl:

```bash
curl -H "Authorization: Bearer seu_token_jwt" http://localhost:3000/agentes
```

## Logout de usuário

### Endpoint: POST /auth/logout

### Authorization: Bearer <seu_jwt_token>

Resposta (200):

```bash
{
    "status": 200,
    "message": "Logout realizado com sucesso"
}
```

## Dados do usuário

### Endpoint: GET /auth/usuarios/me

### Authorization: Bearer <seu_jwt_token>

Resposta (200):

```bash
{
    "status": 200,
    "data": {
        "id": 1,
        "nome": "Matheus",
        "email": "matheus@example.com",
        "created_at": "2025-08-21T12:00:00Z"
    }
}
```

## Exclusão de usuário

### Endpoint: DELETE /auth/usuarios/:id

### Authorization: Bearer <seu_jwt_token>

## Fluxo de autenticação

- O usuário se registra em /auth/register.
- Faz login em /auth/login e recebe um JWT.
- Para acessar rotas protegidas, inclui o JWT no header Authorization.
- Para logout, basta chamar /auth/logout (com token válido). O cliente remove o token.
- Para renovar, cliente deve fazer login novamente.

## Endpoints Protegidos (Requerem Token JWT)

GET /agentes - Listar todos os agentes
POST /agentes - Criar novo agente
GET /agentes/:id - Buscar agente específico
PUT /agentes/:id - Atualizar todos os dados do agente
PATCH /agentes/:id - Atualização parcial do agente
DELETE /agentes/:id - Excluir agente
GET /agentes/:id/casos - Listar casos de um agente
GET /casos - Listar todos os casos
POST /casos - Criar novo caso
GET /casos/:id - Buscar caso específico
PUT /casos/:id - Atualizar todos os dados do caso
PATCH /casos/:id - Atualização parcial do caso
DELETE /casos/:id - Excluir caso
POST /auth/logout - Logout do usuário
DELETE /auth/usuarios/:id - Excluir usuário
GET /auth/usuarios/me - Obter informações do usuário autenticado

## Endpoints Públicos (Não requerem autenticação)

POST /auth/register - Registrar novo usuário
POST /auth/login - Login de usuário
GET /docs - Documentação Swagger
