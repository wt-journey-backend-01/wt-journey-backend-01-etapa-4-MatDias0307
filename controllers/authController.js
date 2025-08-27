const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuariosRepository');
const { tokenBlacklist } = require('../middlewares/authMiddleware');

function validateId(id) {
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId > 0;
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(senha) {
    const minLength = senha.length >= 8;
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasLowerCase = /[a-z]/.test(senha);
    const hasNumber = /\d/.test(senha);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

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
    
    if (body.email && !validateEmail(body.email)) {
        errors.push("Email inválido");
    }
    
    if (body.senha && !validatePassword(body.senha)) {
        errors.push("Senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais");
    }
    
    return errors;
}

async function register(req, res) {
    try {
        const errors = validateRegisterPayload(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "Dados inválidos",
                errors
            });
        }

        const { nome, email, senha } = req.body;

        const emailNormalizado = email.trim().toLowerCase();

        const usuarioExistente = await usuariosRepository.findByEmail(emailNormalizado);
        if (usuarioExistente) {
            return res.status(400).json({
                status: 400,
                message: "Email já está em uso"
            });
        }

        const novoUsuario = await usuariosRepository.create({ 
            nome, 
            email: emailNormalizado, 
            senha 
        });
        
        res.status(201).json({
            status: 201,
            message: "Usuário criado com sucesso",
            data: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                created_at: novoUsuario.created_at.toISOString()
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

async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                status: 400,
                message: "Email e senha são obrigatórios"
            });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const usuario = await usuariosRepository.findByEmail(emailNormalizado);
        
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
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            tokenBlacklist.add(token);
        }
        
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

async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        if (!validateId(id)) {
            return res.status(400).json({
                status: 400,
                message: "ID inválido"
            });
        }

        if (parseInt(id) !== req.user.id) {
            return res.status(403).json({
                status: 403,
                message: "Permissão negada: você só pode excluir sua própria conta"
            });
        }
        
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
        res.json({
            status: 200,
            data: {
                id: req.user.id,
                nome: req.user.nome,
                email: req.user.email,
                created_at: req.user.created_at ? req.user.created_at.toISOString() : null
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