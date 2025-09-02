<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para MatDias0307:

Nota final: **50.3/100**

Olá, MatDias0307! 👋🚀

Primeiramente, parabéns pelo empenho e pela entrega do seu projeto! 🎉 Você conseguiu implementar várias funcionalidades essenciais para uma API REST segura com Node.js, Express e PostgreSQL, além de organizar o código dentro da estrutura MVC, o que é fundamental para projetos profissionais. Também é muito legal ver que você documentou bem os endpoints no **INSTRUCTIONS.md** e integrou o Swagger para a documentação da API. Isso mostra cuidado e profissionalismo! 👏

---

## 🎯 Conquistas Bônus que você alcançou

- Implementou corretamente o registro, login, logout e exclusão de usuários com JWT.
- Validou senhas com todos os critérios exigidos (maiúsculas, minúsculas, números e caracteres especiais).
- Protegeu as rotas de agentes e casos com middleware de autenticação.
- Implementou mensagens de erro customizadas para parâmetros inválidos.
- Organizou o projeto conforme o padrão MVC, com controllers, repositories, middlewares e rotas separadas.
- Documentou detalhadamente os endpoints, incluindo exemplos e fluxo de autenticação.
- Passou todos os testes obrigatórios de autenticação e autorização.
  
Esses pontos são muito importantes e indicam que você tem uma boa base para construir APIs seguras e organizadas! 🌟

---

## 🚩 Análise dos testes que falharam e principais pontos para melhorar

### Lista dos testes que falharam

- `'USERS: Recebe erro 400 ao tentar criar um usuário com e-mail já em uso'`
- Vários testes de agentes (`AGENTS`) relacionados a criação, listagem, atualização, deleção e validação de dados.
- Vários testes de casos (`CASES`) relacionados a criação, listagem, atualização, deleção e validação de dados.
- Testes bônus relacionados a filtros e endpoints extras.

---

### 1. **Erro 400 ao tentar criar usuário com e-mail já em uso**

**O que está acontecendo?**

No seu `authController.register`, você verifica se o email já existe e retorna 400 com a mensagem correta:

```js
const existingUser = await usersRepository.findByEmail(normalizedEmail);
if (existingUser) {
    return res.status(400).json({
        status: 400,
        message: "Email já está em uso"
    });
}
```

Isso parece correto à primeira vista. Porém, o teste falha, o que indica que talvez:

- A verificação não esteja funcionando corretamente por algum motivo.
- O banco pode estar aceitando e-mails duplicados (problema na migration).
- O `findByEmail` pode não estar normalizando o email para comparação.

**Análise detalhada:**

- Na migration, você criou a tabela `usuarios` com `email` único:

```js
table.string("email").unique().notNullable();
```

- No repositório, você faz a busca com:

```js
async function findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    return await db("usuarios").where({ email: normalizedEmail }).first();
}
```

- No controller, você normaliza o email antes de chamar `findByEmail`.

Tudo parece correto.

**Possível causa raiz:**

O problema pode estar na forma como o e-mail está sendo armazenado e consultado no banco, especialmente se o banco não está tratando o índice único de forma case-insensitive. Por padrão, o PostgreSQL é case-sensitive para strings, então pode haver emails com maiúsculas e minúsculas considerados diferentes.

**Solução recomendada:**

- Garanta que o email seja sempre armazenado em minúsculas (você já faz isso no repositório).
- Para garantir que o índice único funcione corretamente, você pode criar um índice único com `LOWER(email)` no banco, ou usar uma coluna com `citext` (tipo de dado case-insensitive do PostgreSQL).

Como alternativa imediata, verifique se você está realmente normalizando o email em todos os lugares e se não está tentando criar dois usuários com emails que diferem só em maiúsculas/minúsculas.

---

### 2. **Falhas nos testes de agentes (AGENTS) e casos (CASES) relacionados a criação, listagem, atualização, deleção e validação**

Você tem muitos testes falhando para agentes e casos, especialmente:

- Criação correta com status 201 e dados inalterados.
- Listagem correta com status 200 e dados completos.
- Atualização (PUT e PATCH) com status 200 e dados atualizados.
- Deleção com status 204 e corpo vazio.
- Erros 400 e 404 para payloads ou IDs inválidos.

**O que pode estar causando isso?**

Ao analisar seu código nos controllers e repositories, encontrei alguns detalhes importantes que podem estar causando esses erros:

#### a) Parâmetros invertidos nos métodos update do repositório de agentes e casos

No seu `agentesRepository.js`, o método `update` está assim:

```js
async function update(updatedData, id) {
  const [updated] = await db("agentes").where({ id: Number(id) }).update(updatedData).returning("*");
  return updated ? mapAgent(updated) : null;
}
```

Mas no controller você chama:

```js
const updatedAgent = await agentsRepository.update(req.params.id, req.body);
```

Ou seja, você está passando `id` primeiro e depois `updatedData`, mas o método espera `updatedData` primeiro e depois `id`.

**Isso gera um erro silencioso**, pois o knex vai tentar atualizar com `where({ id: Number(updatedData) })` que não faz sentido.

**Mesma situação no `casosRepository.js`:**

```js
async function update(updatedData, id) {
    const [updated] = await db("casos").where({ id: Number(id) }).update(updatedData).returning("*");
    return updated || null;
}
```

E no controller:

```js
const updatedCase = await casesRepository.update(req.params.id, req.body);
```

**Solução:**

Padronize a ordem dos parâmetros para `update(id, updatedData)` para evitar confusão, ou ajuste a chamada para passar na ordem correta.

Por exemplo, no `agentesRepository.js`:

```js
async function update(id, updatedData) {
  const [updated] = await db("agentes").where({ id: Number(id) }).update(updatedData).returning("*");
  return updated ? mapAgent(updated) : null;
}
```

E no controller:

```js
const updatedAgent = await agentsRepository.update(req.params.id, req.body);
```

Faça o mesmo para casos.

---

#### b) Falta de transformação dos dados retornados no repositório de casos

No `casosRepository.js` você retorna os dados crus do banco, sem formatar a data, diferente do que faz em agentes com o método `mapAgent`.

Isso pode gerar inconsistências no formato esperado pelos testes.

Sugestão: crie uma função `mapCase` para formatar a data (se houver) e retorne os dados formatados.

---

#### c) Validação e mensagens de erro

Nos seus controllers de agentes e casos, você está validando os dados e retornando erros customizados, o que é ótimo.

Porém, em alguns lugares você retorna arrays de erros com objetos `{ field, message }` e em outros apenas strings, por exemplo:

```js
return res.status(400).json({
    status: 400,
    message: "Parâmetros inválidos",
    errors: ["O parâmetro 'sort' deve ser 'dataDeIncorporacao' ou '-dataDeIncorporacao'"]
});
```

Mas em outros:

```js
errors.push({ field: 'id', message: "O campo 'id' não pode ser alterado" });
```

Essa inconsistência pode confundir os testes que esperam um formato específico para os erros.

---

### 3. **Testes bônus que falharam: filtros e endpoint /usuarios/me**

Você implementou o endpoint `/auth/me` e parece que ele está no lugar correto (`authRoutes.js` e `authController.js`), mas o teste bônus falhou.

Possíveis motivos:

- A rota no Swagger está documentada como `/auth/me`, mas no enunciado do desafio e no INSTRUCTIONS.md é `/auth/usuarios/me`.
- No seu arquivo `authRoutes.js`, a rota está:

```js
router.get('/me', authMiddleware, authController.getMe);
```

Mas o enunciado pede:

```
GET /auth/usuarios/me
```

Ou seja, o endpoint deveria estar em `/auth/usuarios/me`.

**Solução:**

Altere a rota para:

```js
router.get('/usuarios/me', authMiddleware, authController.getMe);
```

Assim, o teste bônus que valida o endpoint `/usuarios/me` deve passar.

---

### 4. **Middleware de autenticação e uso de cookies**

Seu middleware `authMiddleware.js` tenta ler o token JWT tanto do cookie `access_token` quanto do header `Authorization`.

Isso é ótimo para flexibilidade, porém, no seu controller de login você está enviando o token tanto no cookie quanto no corpo da resposta.

Se o cliente usar apenas o token do cookie, pode haver confusão.

Além disso, seu `server.js` não mostra o uso do middleware `cookie-parser`, que é necessário para ler cookies via `req.cookies`.

**Se não estiver usando `cookie-parser`, `req.cookies` será `undefined`.**

**Solução:**

- Instale e configure o `cookie-parser` no `server.js`:

```js
const cookieParser = require('cookie-parser');
app.use(cookieParser());
```

- Ou, se quiser usar só o header Authorization, remova o uso de cookies para evitar inconsistências.

---

### 5. **Estrutura dos diretórios**

Sua estrutura de pastas está correta e segue o padrão esperado, incluindo os novos arquivos para autenticação (`authController.js`, `authRoutes.js`, `usuariosRepository.js`, `authMiddleware.js`).

Parabéns por isso! Isso facilita muito a manutenção e entendimento do código.

---

## Exemplos de correções importantes

### Corrigindo a ordem dos parâmetros no método update do agentesRepository.js

Antes:

```js
async function update(updatedData, id) {
  const [updated] = await db("agentes").where({ id: Number(id) }).update(updatedData).returning("*");
  return updated ? mapAgent(updated) : null;
}
```

Depois (padronizando para `update(id, updatedData)`):

```js
async function update(id, updatedData) {
  const [updated] = await db("agentes").where({ id: Number(id) }).update(updatedData).returning("*");
  return updated ? mapAgent(updated) : null;
}
```

E ajuste no controller:

```js
const updatedAgent = await agentsRepository.update(req.params.id, req.body);
```

---

### Corrigindo a rota `/usuarios/me` em authRoutes.js

Antes:

```js
router.get('/me', authMiddleware, authController.getMe);
```

Depois:

```js
router.get('/usuarios/me', authMiddleware, authController.getMe);
```

---

### Instalando e usando cookie-parser no server.js

Adicione no início:

```js
const cookieParser = require('cookie-parser');
```

E antes das rotas:

```js
app.use(cookieParser());
```

---

## Recomendações de estudo para você 📚

- Para entender melhor **JWT e autenticação**, recomendo fortemente este vídeo, feito pelos meus criadores, que explica os conceitos básicos e práticas de segurança:  
  https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para aprofundar no uso de **JWT na prática com Node.js**, veja este tutorial que mostra passo a passo:  
  https://www.youtube.com/watch?v=keS0JWOypIU

- Para entender o uso correto do **bcrypt para hashing de senhas**, este vídeo é excelente:  
  https://www.youtube.com/watch?v=L04Ln97AwoY

- Se quiser reforçar a configuração do ambiente com **Docker e Knex migrations**, recomendo:  
  https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s  
  https://www.youtube.com/watch?v=dXWy_aGCW1E  
  https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s

- Para organizar seu código seguindo boas práticas MVC, este vídeo é top:  
  https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

---

## 📝 Resumo dos principais pontos para focar e melhorar

- **Corrija a ordem dos parâmetros no método `update` dos repositories de agentes e casos** para que o `id` venha antes dos dados atualizados, e ajuste as chamadas nos controllers.

- **Ajuste a rota `/usuarios/me` no `authRoutes.js`** para que seja `/usuarios/me` e não apenas `/me`, conforme o enunciado e testes.

- **Verifique a normalização e unicidade do email para evitar duplicatas**, considerando que o PostgreSQL é case-sensitive para strings. Avalie criar um índice único com `LOWER(email)` ou usar o tipo `citext`.

- **Configure o middleware `cookie-parser` no `server.js`** para que o `authMiddleware` consiga ler os cookies, ou opte por usar somente o header Authorization para o token JWT.

- **Padronize a estrutura dos erros retornados**, usando sempre arrays de strings ou objetos com `field` e `message`, para garantir que os testes reconheçam as mensagens.

- **Considere formatar os dados retornados no repository de casos**, para manter consistência com agentes (ex: datas no formato ISO).

---

Matheus, você está no caminho certo e já tem uma base muito sólida! Com esses ajustes, sua API vai ficar ainda mais robusta, segura e alinhada aos padrões profissionais. Continue firme, revise com calma esses pontos e não hesite em buscar os recursos indicados para aprofundar seu conhecimento. Estou aqui para ajudar no que precisar! 💪✨

Bons códigos e até a próxima! 👨‍💻🚓

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>