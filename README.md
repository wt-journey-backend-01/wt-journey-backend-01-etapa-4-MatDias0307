# Atividade - Etapa 4 - Segurança, Autenticação e Aplicação Completa em Node.js - WebTech Journey - Backend - 2025

## Estrutura do Projeto
  - police-api/
    - package.json
    - server.js
    - knexfile.js
    - .env
    - routes/
      - agentesRoutes.js 
      - casosRoutes.js
      - authRoutes.js
    - controllers/
      - agentesController.js 
      - casosController.js
      - authController.js
    - repositories/
      - agentesRepository.js
      - casosRepository.js
      - usuariosRepository.js
    - middlewares/
      - authMiddleware.js
    - db/
      - migrations/
      - seeds/
    - utils/
      - errorHandler.js
    - docs/
      - swagger.js

## Endpoints - Autenticação (/auth)
1. POST /auth/register → Registrar novo usuário
2. POST /auth/login → Login de usuário
3. POST /auth/logout → Logout do usuário autenticado
4. GET /auth/usuarios/me → Dados do usuário autenticado
5. DELETE /auth/usuarios/:id → Excluir usuário

Autenticação:
As rotas protegidas utilizam JWT (JSON Web Token).
```bash
O token deve ser enviado no header:
```

## Endpoints - Agentes Policiais (/agentes)
1. GET    /agentes          - Lista todos os agentes
2. GET    /agentes/:id      - Obtém um agente específico
3. POST   /agentes          - Cria novo agente
4. PUT    /agentes/:id      - Atualiza todos os dados
5. PATCH  /agentes/:id      - Atualização parcial
6. DELETE /agentes/:id      - Remove agente

- Filtros:
  - ?cargo= - Filtra por cargo (delegado, inspetor, detetive)
  - ?sort=dataDeIncorporacao - Ordena por data (prefixo - para descendente)

## Endpoints - Casos Policiais (/casos)
1. GET    /casos            - Lista todos os casos
2. GET    /casos/:id        - Obtém caso específico
3. POST   /casos            - Cria novo caso
4. PUT    /casos/:id        - Atualiza todos os dados
5. PATCH  /casos/:id        - Atualização parcial
6. DELETE /casos/:id        - Remove caso

- Filtros:
  - ?agente_id= - Filtra por agente responsável
  - ?status= - Filtra por status (aberto, solucionado)
  - ?q= - Busca full-text no título e descrição

## Tecnologias Utilizadas
- Node.js  
- Express  
- PostgreSQL  
- Docker 
- Knex.js 
- Swagger
- JWT

## Como Executar o Projeto
### 1. Crie um arquivo `.env` na raiz com:
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=policia_db
JWT_SECRET=seu_super_segredo_jwt_aqui_muito_longo_e_complexo
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

### 2. Instale as dependências:
```bash
npm install
```

### 3. Subir o banco com Docker:
```bash
docker-compose up -d
```

### 4. Rodar as migrations:
```bash
npx knex migrate:latest
```

### 5. Rodar os seeds:
```bash
npm run seed:run
```

### 6. Iniciar o servidor:
```bash
npm start
```

### 7. Acessar a aplicação:
- API: http://localhost:3000
- Docs: http://localhost:3000/docs

### 8.  Reset completo do banco de dados:
```bash
npm run db:reset
```

## Fluxo de autenticação

- O usuário se registra em /auth/register.
- Faz login em /auth/login e recebe um JWT.
- Para acessar rotas protegidas, inclui o JWT no header Authorization.
- Para logout, basta chamar /auth/logout (com token válido). O cliente remove o token.
- Para renovar, cliente deve fazer login novamente.