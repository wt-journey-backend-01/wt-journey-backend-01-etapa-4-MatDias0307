<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 8 créditos restantes para usar o sistema de feedback AI.

# Feedback para MatDias0307:

Nota final: **27.5/100**

Oi MatDias0307! Tudo certo? 😊 Vamos juntos analisar seu projeto e destravar essa nota para você! 🚀

---

## 🎉 Parabéns pelos Acertos!

Primeiro, quero destacar que você já acertou várias coisas importantes:

- A estrutura geral do projeto está muito bem organizada, com os diretórios `routes/`, `controllers/`, `repositories/` e `middlewares/` devidamente separados.
- O uso do middleware de autenticação (`authMiddleware`) nas rotas sensíveis (`/agentes` e `/casos`) está correto.
- A implementação básica do registro, login, logout e exclusão de usuários está presente e funcionando, incluindo a geração do JWT e hashing das senhas com bcryptjs.
- Você documentou muito bem os endpoints no `INSTRUCTIONS.md` e usou Swagger para documentação das rotas.
- Os testes básicos de autenticação, criação, listagem e exclusão de agentes e casos passaram, o que já mostra que você tem uma boa base.
- Bônus: você implementou o endpoint `/usuarios/me` para retornar dados do usuário autenticado, o que é um extra muito bacana!

Você está no caminho certo! Agora vamos analisar os pontos que precisam de atenção para melhorar sua nota e garantir que tudo funcione perfeitamente.

---

## ⚠️ Análise dos Testes que Falharam e Pontos para Melhorar

### 1. **Falhas nos Testes de Validação de Usuário (Usuários: erros 400 para campos inválidos ou faltantes)**

Você recebeu muitos erros relacionados à criação de usuários quando os campos são vazios, nulos, com senha fraca, ou com campos extras. Isso indica que sua validação no registro não está cobrindo todos esses casos.

Vamos olhar o trecho do seu `authController.js` que faz a validação:

```js
function validateRegisterPayload(body) {
    const errors = [];
    const allowedFields = ['nome', 'email', 'senha'];
    
    const extraFields = Object.keys(body).filter(field => !allowedFields.includes(field));
    if (extraFields.length > 0) {
        extraFields.forEach(field => {
            errors.push(`Campo '${field}' não é permitido`);
        });
    }
    
    if (!body.nome) errors.push("O campo 'nome' é obrigatório");
    if (!body.email) errors.push("O campo 'email' é obrigatório");
    if (!body.senha) errors.push("O campo 'senha' é obrigatório");
    
    if (body.email && !isValidEmail(body.email)) {
        errors.push("Email inválido");
    }
    
    if (body.senha && !isValidPassword(body.senha)) {
        errors.push("Senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais");
    }
    
    return errors;
}
```

**Por que isso pode estar falhando?**

- Você está checando se `body.nome`, `body.email` e `body.senha` existem, mas não está validando se eles são strings não vazias. Por exemplo, se o `nome` for uma string vazia `""` ou `null`, a validação `if (!body.nome)` pode não capturar corretamente (pois `""` é falsy, mas `null` ou `undefined` também, porém pode ser que o teste envie valores diferentes).
- Também não há validação explícita para campos nulos ou vazios (ex: `nome: ""` ou `email: null`).
- A função `isValidPassword` está correta, mas não há um feedback detalhado para cada tipo de falha (ex: "senha sem número", "senha sem caractere especial"). Isso pode fazer o teste esperar mensagens específicas.
- A validação de campos extras está boa!

**Como melhorar?**

Você pode reforçar a validação para checar se os campos são strings não vazias, por exemplo:

```js
if (!body.nome || typeof body.nome !== 'string' || body.nome.trim() === '') {
    errors.push("O campo 'nome' é obrigatório e deve ser uma string não vazia");
}
if (!body.email || typeof body.email !== 'string' || body.email.trim() === '') {
    errors.push("O campo 'email' é obrigatório e deve ser uma string não vazia");
}
if (!body.senha || typeof body.senha !== 'string' || body.senha.trim() === '') {
    errors.push("O campo 'senha' é obrigatório e deve ser uma string não vazia");
}
```

Além disso, para a senha, você pode melhorar a função `isValidPassword` para retornar mensagens específicas de erro, assim o teste pode receber mensagens claras para cada regra violada.

---

### 2. **Falha no Teste: "USERS: Recebe erro 400 ao tentar criar um usuário com e-mail já em uso"**

Você já faz a verificação no controller:

```js
const existingUser = await usersRepository.findByEmail(normalizedEmail);
if (existingUser) {
    return res.status(400).json({
        status: 400,
        message: "Email já está em uso"
    });
}
```

E também captura erro do banco:

```js
if (error.code === '23505' && error.constraint === 'usuarios_email_unique') {
    return res.status(400).json({
        status: 400,
        message: "Email já está em uso"
    });
}
```

**Possível causa:** A constraint no banco pode ter nome diferente, ou a verificação no banco não está sendo acionada corretamente. Confirme se a migration criou o índice único para o campo `email` na tabela `usuarios`.

No seu arquivo de migration:

```js
await knex.schema.createTable("usuarios", (table) => {
  table.increments("id").primary();
  table.string("nome").notNullable();
  table.string("email").unique().notNullable();
  table.string("senha").notNullable();
});
```

Está correto, então o problema pode ser na forma como você está tratando o erro. Talvez o erro não esteja chegando com a propriedade `constraint` igual a `'usuarios_email_unique'`. Para garantir, você pode imprimir o erro para debug, ou simplesmente retornar o erro 400 com a mensagem "Email já está em uso" para qualquer erro de violação de unicidade.

---

### 3. **Falha nos Testes de Filtragem e Busca Avançada de Casos e Agentes (Testes Bônus)**

Você não passou os testes bônus que envolvem:

- Filtragem de casos por status, agente e keywords no título/descrição.
- Busca de casos do agente.
- Filtragem de agentes por data de incorporação com ordenação.
- Mensagens customizadas para parâmetros inválidos.
- Endpoint `/usuarios/me` retornando dados do usuário logado.

Analisando o código:

- No `casosRepository.js`, a função `searchWithFilters` parece implementar os filtros, mas está faltando o retorno do campo `data` formatado para todos os casos? Você está formatando, mas não vi o retorno completo do campo `data` em todos os lugares.

- O `casosController.js` chama `searchWithFilters` e retorna 404 quando não encontra casos, o que está correto.

- No `agentesController.js`, você implementou o filtro por cargo e ordenação, mas talvez o teste espere mensagens de erro mais específicas para parâmetros inválidos. Você pode melhorar as mensagens para serem exatamente iguais ao esperado no teste.

- Além disso, o endpoint `/usuarios/me` está implementado no `authController.js` e na rota `authRoutes.js` como `/auth/usuarios/me`, porém no `INSTRUCTIONS.md` e na documentação Swagger, o endpoint aparece como `/auth/me`. Isso pode causar falha no teste se o caminho não estiver exatamente igual ao esperado.

**Sugestão:**

- Alinhe o endpoint `/usuarios/me` para `/auth/me` conforme a documentação e teste, para garantir compatibilidade.

- Verifique se as mensagens de erro são exatamente as esperadas pelo teste, pois testes automatizados são sensíveis a isso.

---

### 4. **Duplicidade da Função logout no authController.js**

Notamos que você definiu a função `logout` duas vezes no `authController.js`:

```js
async function logout(req, res) {
    try {
        res.json({
            status: 200,
            message: "Logout realizado com sucesso"
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('access_token');
        
        res.json({
            status: 200,
            message: "Logout realizado com sucesso"
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}
```

A segunda definição sobrescreve a primeira, o que não é um erro grave, mas pode causar confusão. Além disso, você está tentando limpar um cookie chamado `access_token`, mas no seu login você não está enviando esse cookie, apenas retornando o token no JSON.

**Dica:** Se você não está usando cookies para autenticação, não faz sentido limpar o cookie no logout. O logout em JWT geralmente consiste em o cliente simplesmente descartar o token. Se quiser implementar blacklist ou revogação, precisa de lógica adicional.

---

### 5. **Verificação do JWT_SECRET**

No seu middleware `authMiddleware.js` e no controller de login, você usa:

```js
process.env.JWT_SECRET || "secret"
```

Isso é um problema para produção e testes, porque o segredo deve vir da variável de ambiente obrigatoriamente. Se não estiver definido, o token pode ser gerado/verificado com uma string padrão que não é segura.

**Solução:**

Exija que a variável `JWT_SECRET` esteja definida e lance um erro ou retorne 500 se não estiver. Isso evita problemas de segurança e falhas nos testes.

Exemplo no `authMiddleware.js`:

```js
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET não está definido");
}
const usuario = jwt.verify(token, jwtSecret);
```

---

### 6. **Outros Detalhes Importantes**

- No `usuariosRepository.js`, o método `findById` retorna apenas `id`, `nome` e `email`, mas no controller você tenta acessar `created_at`, que não está sendo selecionado. Isso pode causar `undefined` e falhas no teste.

- Na migration, a tabela `usuarios` não possui o campo `created_at`. Se o teste espera esse campo, você deve adicioná-lo na migration com `table.timestamp('created_at').defaultTo(knex.fn.now())`.

---

## 📚 Recomendações de Estudo

Para melhorar esses pontos, recomendo fortemente que você assista os seguintes vídeos, eles vão te ajudar muito:

- Para autenticação, JWT e bcrypt:  
  👉 Esse vídeo, feito pelos meus criadores, fala muito bem sobre autenticação e segurança em Node.js: https://www.youtube.com/watch?v=Q4LQOfYwujk  
  👉 Para entender JWT na prática: https://www.youtube.com/watch?v=keS0JWOypIU  
  👉 Para entender bcrypt e hashing de senhas: https://www.youtube.com/watch?v=L04Ln97AwoY  

- Para trabalhar melhor com Knex e migrations:  
  👉 Guia detalhado do Knex Query Builder: https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s  
  👉 Documentação oficial do Knex sobre migrations: https://www.youtube.com/watch?v=dXWy_aGCW1E  

- Para organizar seu projeto e aplicar boas práticas:  
  👉 Refatoração e boas práticas com MVC em Node.js: https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s  

---

## 📝 Resumo dos Principais Pontos para Melhorar

- **Validação do payload de registro:** garanta que campos nulos, vazios e com tipos errados sejam detectados e retornem mensagens claras e específicas.
- **Consistência do endpoint `/usuarios/me`:** alinhe a rota para `/auth/me` conforme esperado nos testes e documentação.
- **JWT_SECRET:** remova o fallback para `"secret"` e exija que a variável de ambiente esteja definida para evitar problemas de segurança e falhas.
- **Campo `created_at` no usuário:** adicione o campo na migration e selecione-o no repositório para evitar erros ao acessar essa propriedade.
- **Evite funções duplicadas:** remova a duplicidade da função `logout` e ajuste a lógica para logout sem cookies, se não estiver usando.
- **Mensagens de erro:** confira se as mensagens de erro retornadas são exatamente as esperadas pelos testes automatizados, especialmente para validações.
- **Filtros e buscas avançadas:** revise as funções de busca e filtros para garantir que estão completas, com formatação correta e mensagens customizadas.
- **Teste localmente:** use ferramentas como Postman para testar todos os endpoints e validar os retornos e erros.

---

## Finalizando...

Matheus, seu projeto tem uma base muito sólida, e você já implementou muitos conceitos importantes de segurança e organização. Com esses ajustes finos na validação, mensagens de erro, e consistência dos endpoints, tenho certeza que você vai destravar todos os testes e alcançar uma nota excelente! 💪

Continue firme, aprendendo e ajustando. Se precisar de ajuda para entender algum ponto específico, só chamar! Estou aqui para te ajudar a crescer como dev. 🚀✨

Um abraço e sucesso! 👊😄

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>