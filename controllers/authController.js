const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuariosRepository');

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(senha) {
    const minLength = senha.length >= 8;
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasLowerCase = /[a-z]/.test(senha);
    const hasNumber = /\d/.test(senha);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

async function register(req, res) {
    try {
        const { nome, email, senha } = req.body;

        // Validações
        if (!nome || !email || !senha) {
            return res.status(400).json({
                status: 400,
                message: "Todos os campos são obrigatórios"
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                status: 400,
                message: "Email inválido"
            });
        }

        if (!validatePassword(senha)) {
            return res.status(400).json({
                status: 400,
                message: "Senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais"
            });
        }

        // Verifica se email já existe
        const usuarioExistente = await usuariosRepository.findByEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({
                status: 400,
                message: "Email já está em uso"
            });
        }

        const novoUsuario = await usuariosRepository.create({ nome, email, senha });
        
        res.status(201).json({
            status: 201,
            message: "Usuário criado com sucesso",
            data: novoUsuario
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                status: 400,
                message: "Email e senha são obrigatórios"
            });
        }

        const usuario = await usuariosRepository.findByEmail(email);
        if (!usuario) {
            return res.status(401).json({
                status: 401,
                message: "Credenciais inválidas"
            });
        }

        const senhaValida = await usuariosRepository.verifyPassword(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({
                status: 401,
                message: "Credenciais inválidas"
            });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.json({
            access_token: token
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
    // Em uma implementação real, você invalidaria o token aqui
    // Para JWT stateless, o cliente apenas remove o token
    res.json({
        status: 200,
        message: "Logout realizado com sucesso"
    });
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        
        const usuario = await usuariosRepository.findById(id);
        if (!usuario) {
            return res.status(404).json({
                status: 404,
                message: "Usuário não encontrado"
            });
        }

        await usuariosRepository.deleteUser(id);
        
        res.status(204).end();
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

async function getMe(req, res) {
    try {
        // O middleware já adicionou req.user
        res.json({
            status: 200,
            data: {
                id: req.user.id,
                nome: req.user.nome,
                email: req.user.email,
                created_at: req.user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}

module.exports = {
    register,
    login,
    logout,
    deleteUser,
    getMe
};