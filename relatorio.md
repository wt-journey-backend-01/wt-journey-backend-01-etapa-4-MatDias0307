<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 8 créditos restantes para usar o sistema de feedback AI.

# Feedback para MatDias0307:

Nota final: **48.7/100**

# Feedback para MatDias0307 🚓🔐

Olá Matheus! Primeiro, parabéns pelo esforço e pela estruturação do seu projeto! 🎉 Você conseguiu implementar uma API robusta, com autenticação via JWT, rotas protegidas, e uma organização clara entre controllers, repositories, rotas e middlewares. Isso é essencial para projetos profissionais e escaláveis. Além disso, você já implementou os bônus como o endpoint `/usuarios/me` para retornar os dados do usuário autenticado e a filtragem simples em agentes e casos, o que mostra dedicação extra. Excelente! 👏

---

## O que está funcionando muito bem 👍

- A estrutura geral do projeto está muito bem organizada, respeitando a arquitetura MVC e separando responsabilidades.
- As rotas de autenticação (`/auth/register`, `/auth/login`, `/auth/logout`) estão implementadas corretamente com validação adequada.
- O middleware de autenticação está fazendo a verificação do JWT e adicionando o usuário autenticado no `req.user`.
- O uso do `bcryptjs` para hash das senhas e a validação rigorosa da senha no `authController` estão corretos.
- A documentação no `INSTRUCTIONS.md` está clara, detalhada e cobre todos os passos para rodar o projeto e usar os endpoints.
- Você implementou o blacklist de tokens para logout, o que é uma boa prática para invalidar tokens.
- Os controllers de agentes e casos têm validações sólidas e mensagens de erro claras.
- O JWT é gerado com segredo vindo da variável de ambiente e tem tempo de expiração configurável.
- A filtragem simples por cargo, status, e busca por palavras-chave está presente, o que é um bônus importante.

---

## Pontos de atenção e melhorias para destravar tudo 🚨

### 1. **Erro ao criar usuário com email já em uso (Erro 400 esperado)**

Você já faz a verificação correta no `authController.register`:

```js
const usuarioExistente = await usuariosRepository.findByEmail(email);
if (usuarioExistente) {
    return res.status(400).json({
        status: 400,
        message: "Email já está em uso"
    });
}
```

**Por que pode estar falhando?**

- Confirme se a tabela `usuarios` realmente está criada e migrada corretamente. Seu arquivo de migration `20250821224959_create_usuarios_table.js` está correto, mas verifique se você rodou `npx knex migrate:latest` após criar essa migration.
- Se a migration não foi aplicada, o banco não terá a tabela e isso pode causar erros.
- Também, verifique se o email está sendo armazenado em caixa baixa, para evitar duplicidade por diferença de maiúsculas/minúsculas.

**Recomendação:**  
Se ainda não fez, rode o reset do banco para garantir que a tabela `usuarios` existe:

```bash
npm run db:reset
```

E confira se os dados estão sendo inseridos corretamente.

Além disso, para evitar problemas com case sensitivity, você pode normalizar o email para minúsculas antes de salvar e consultar:

```js
const emailLower = email.toLowerCase();
const usuarioExistente = await usuariosRepository.findByEmail(emailLower);
// E ao criar:
const novoUsuario = await usuariosRepository.create({ nome, email: emailLower, senha });
```

---

### 2. **Resposta do login com campo `access_token` e não `acess_token`**

Na descrição do desafio, o token deve ser retornado com a chave `access_token` (com dois "c"):

```json
{
  "access_token": "token aqui"
}
```

No seu `authController.login`, está correto:

```js
res.json({
    access_token: token
});
```

Mas no enunciado inicial do desafio, na parte de status codes, você colocou um exemplo com `acess_token` (um "c" só):

```json
{
    acess_token: "token aqui"
}
```

Se algum teste usa esse nome errado, pode dar problema. Mas pelo seu código, está correto. Só fique atento para sempre usar `access_token`.

---

### 3. **Middleware de autenticação e proteção das rotas**

Seu middleware `authMiddleware.js` está implementado corretamente, verificando o token, validando com o segredo do `.env` e buscando o usuário no banco. Isso é ótimo!

```js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const usuario = await usuariosRepository.findById(decoded.id);
if (!usuario) {
    return res.status(401).json({
        status: 401,
        message: "Usuário não encontrado"
    });
}
req.user = usuario;
next();
```

**Sugestão:**  
Para melhorar a performance, você pode armazenar no token o nome do usuário também e evitar a consulta no banco para cada requisição, mas sua forma atual é mais segura, pois garante que o usuário ainda existe.

---

### 4. **Logout e blacklist de tokens**

Você implementou um `Set` chamado `tokenBlacklist` para invalidar tokens no logout:

```js
const tokenBlacklist = new Set();

async function logout(req, res) {
    // Aqui deveria adicionar o token ao blacklist
    // Mas no seu controller, não há essa lógica
    res.json({
        status: 200,
        message: "Logout realizado com sucesso"
    });
}
```

**Problema:**  
Você não está adicionando o token ao blacklist no logout, então o token continua válido mesmo após logout, o que quebra a segurança.

**Como corrigir:**

No seu `authController.logout`, receba o token do header e adicione ao blacklist:

```js
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

if (token) {
    tokenBlacklist.add(token);
}
res.json({
    status: 200,
    message: "Logout realizado com sucesso"
});
```

Mas atenção: o `tokenBlacklist` está definido no middleware, e não é exportado para o controller. Para manter a arquitetura limpa, o ideal é criar um serviço para gerenciar o blacklist ou armazenar tokens inválidos em cache/DB.

Para um projeto simples, você pode exportar o `tokenBlacklist` do middleware e importar no controller, mas cuidado com isso em produção.

---

### 5. **Endpoint DELETE /auth/usuarios/:id**

Seu controller `authController.deleteUser` está correto ao validar o ID e deletar o usuário:

```js
const usuario = await usuariosRepository.findById(id);
if (!usuario) {
    return res.status(404).json({
        status: 404,
        message: "Usuário não encontrado"
    });
}

await usuariosRepository.deleteUser(id);

res.status(204).end();
```

**Possível problema:**

- Verifique se o usuário autenticado tem permissão para deletar o usuário indicado (por exemplo, só pode deletar a si mesmo ou administradores podem deletar qualquer um). Se não houver essa lógica, qualquer usuário autenticado pode deletar qualquer outro, o que pode ser um risco.

---

### 6. **Validação da senha e campos extras**

Sua validação no `authController` para registro está muito boa, inclusive rejeitando campos extras:

```js
const extraFields = Object.keys(body).filter(field => !allowedFields.includes(field));
if (extraFields.length > 0) {
    extraFields.forEach(field => {
        errors.push(`Campo '${field}' não é permitido`);
    });
}
```

Isso ajuda a evitar dados inesperados no payload, o que é uma ótima prática.

---

### 7. **Filtros e ordenação nas rotas de agentes e casos**

Você implementou filtros e ordenação no `agentesController` e `casosController`. Isso é ótimo!

Por exemplo, no `agentesController.getAllAgentes`:

```js
if (sort && !['dataDeIncorporacao', '-dataDeIncorporacao'].includes(sort)) {
    return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
        errors: ["O parâmetro 'sort' deve ser 'dataDeIncorporacao' ou '-dataDeIncorporacao'"]
    });
}
```

E no repository:

```js
async function findFiltered({ cargo, sort } = {}) {
  const qb = db('agentes');

  if (cargo) {
    qb.where('cargo', 'ilike', cargo);
  }

  if (sort) {
    const order = sort.startsWith('-') ? 'desc' : 'asc';
    qb.orderBy('dataDeIncorporacao', order);
  }

  return await qb.select('*');
}
```

**Sugestão:**  
Para garantir que a ordenação funcione mesmo quando o parâmetro vem com maiúsculas ou espaços, normalize o parâmetro `sort` antes de usar.

---

### 8. **Campos de data no banco**

Na migration `20250807024232_solution_migrations.js`, você criou a coluna `dataDeIncorporacao` como `date`:

```js
table.date('dataDeIncorporacao').notNullable();
```

No seu controller, você valida a data no formato `YYYY-MM-DD`, o que está correto.

---

### 9. **Recomendação geral para segurança**

- Nunca exponha a senha do usuário em respostas JSON.
- Você está retornando no registro o usuário com `id`, `nome`, `email` e `created_at`, o que está certo.
- No endpoint `/usuarios/me`, você retorna os dados do usuário autenticado corretamente, mas lembre-se de não retornar a senha.

---

## Recursos para você aprofundar e corrigir os pontos acima 🚀

- Para entender melhor a autenticação JWT e práticas de segurança, recomendo fortemente este vídeo, feito pelos meus criadores, que fala muito bem sobre o tema:  
  https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para trabalhar com JWT na prática e evitar erros comuns:  
  https://www.youtube.com/watch?v=keS0JWOypIU

- Para implementar hashing de senhas com bcrypt e entender melhor a segurança envolvida:  
  https://www.youtube.com/watch?v=L04Ln97AwoY

- Se quiser garantir que suas migrations e seeds estão funcionando corretamente, este vídeo do Knex é excelente:  
  https://www.youtube.com/watch?v=dXWy_aGCW1E

---

## Resumo rápido dos principais pontos para focar 👀

- **Certifique-se de que a migration da tabela `usuarios` foi aplicada corretamente.** Rode o reset do banco para garantir.
- **Normalize o email para minúsculas antes de salvar e consultar no banco** para evitar duplicidades.
- **No logout, adicione o token ao blacklist para invalidar o JWT.** Ajuste a arquitetura para compartilhar o blacklist entre middleware e controller.
- **Verifique permissões para o endpoint de exclusão de usuários**, para evitar que usuários deletem outros indevidamente.
- **Mantenha a consistência do nome do campo `access_token` no login.**
- **Continue validando rigorosamente os dados de entrada, como já está fazendo, para evitar dados inválidos ou maliciosos.**
- **Aprimore a filtragem e ordenação tratando possíveis variações de caixa e espaços.**
- **Não retorne senhas em nenhuma resposta JSON.**

---

Matheus, seu código mostra que você já domina muitos conceitos importantes de segurança e organização de APIs. Com alguns ajustes finos, seu projeto vai ficar impecável e pronto para produção! Continue assim, estudando e aplicando boas práticas. Estou aqui para ajudar sempre que precisar! 🚀💪

Um abraço de Code Buddy! 🤖✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>