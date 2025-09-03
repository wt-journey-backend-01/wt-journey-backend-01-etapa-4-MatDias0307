const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuariosRepository = require("../repositories/usuariosRepository.js");
const positiveIntegerRegex = /^\d+$/; 
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function validateUserData(data, allowedFields, isLogin = false) {
  const errors = {};
  const fields = Object.keys(data);

  const invalidFields = fields.filter(field => !allowedFields.includes(field));
  if (invalidFields.length > 0) {
    errors.invalidFields = "Campos extras não são permitidos";
  }

  if (!isLogin) {
    if (!data.nome || data.nome.trim() === "") {
      errors.nome = "Nome obrigatório";
    }
  }

  if (!data.email || data.email.trim() === "") {
    errors.email = "E-mail obrigatório";
  }

  if (!data.senha || data.senha.trim() === "") {
    errors.senha = "Senha obrigatória";
  } else if (!isLogin && !passwordRegex.test(data.senha)) {
    errors.senha = "Senha inválida. Use uma combinação de letras maiúsculas e minúsculas, números e caracteres especiais";
  }

  return errors;
}

async function registerUser(req, res) {
  try {
    const { nome, email, senha } = req.body;
    const allowedFields = ["nome", "email", "senha"];
    
    const errors = validateUserData(req.body, allowedFields);
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: errors 
      });
    }

    const existingUser = await usuariosRepository.find(email);
    if (existingUser) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { email: "O usuário já está cadastrado" } 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const newUser = { nome, email, senha: hashedPassword };
    const createdUser = await usuariosRepository.create(newUser);
    
    return res.status(201).json({ 
      nome: createdUser.nome, 
      email: createdUser.email 
    });
  } catch (error) {
    console.log("Error in: registerUser\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, senha } = req.body;
    const allowedFields = ["email", "senha"];
    
    const errors = validateUserData(req.body, allowedFields, true);
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: 400, 
        message: "Dados não enviados corretamente", 
        error: errors 
      });
    }

    const user = await usuariosRepository.find(email);
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Credenciais inválidas",
      });
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 401,
        message: "Credenciais inválidas",
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        nome: user.nome, 
        email: user.email 
      }, 
      process.env.JWT_SECRET || "secret", 
      { expiresIn: "1d" }
    );

    res.cookie("access_token", token, { 
      httpOnly: true, 
      secure: false, 
      sameSite: "strict" 
    });

    return res.status(200).json({ access_token: token });
  } catch (error) {
    console.error("Error in: loginUser\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    if (!positiveIntegerRegex.test(id)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Parâmetros inválidos", 
        error: { id: "O ID deve ter um padrão válido" } 
      });
    }
    
    const success = await usuariosRepository.remove(id);
    if (success === 0) {
      return res.status(404).json({ 
        status: 404, 
        message: "Usuário não encontrado" 
      });
    }
    
    return res.status(204).end();
  } catch (error) {
    console.log("Error in: deleteUser\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function logoutUser(req, res) {
  try {
    res.clearCookie("access_token");
    return res.status(204).end();
  } catch (error) {
    console.log("Error in: logoutUser\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

async function getUserProfile(req, res) {
  try {
    const email = req.user.email;
    const user = await usuariosRepository.find(email);

    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        message: "Usuário não encontrado" 
      });
    }

    return res.status(200).json({ 
      id: user.id, 
      nome: user.nome, 
      email: user.email 
    });
  } catch (error) {
    console.log("Error in: getUserProfile\n", error);
    res.status(500).json({ status: 500, message: "Erro interno do servidor" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  deleteUser,
  logoutUser,
  getUserProfile,
};