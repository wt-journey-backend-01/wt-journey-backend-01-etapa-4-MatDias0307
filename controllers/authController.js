const jwt = require('jsonwebtoken');
const usersRepository = require('../repositories/usuariosRepository');

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
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await usersRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: "Email já está em uso"
            });
        }

        const newUser = await usersRepository.create({ 
            nome, 
            email: normalizedEmail,
            senha 
        });
        
        res.status(201).json({
            status: 201,
            message: "Usuário criado com sucesso",
            data: {
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email
            }
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                status: 400,
                message: "Email já está em uso"
            });
        }
        
        res.status(500).json({
            status: 500,
            message: "Erro interno no servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
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

        const normalizedEmail = email.trim().toLowerCase();
        const user = await usersRepository.findByEmail(normalizedEmail);
        
        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Credenciais inválidas"
            });
        }

        const isPasswordValid = await usersRepository.verifyPassword(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 401,
                message: "Credenciais inválidas"
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "secret",
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

        if (!isValidId(id)) {
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
        
        const user = await usersRepository.findById(id);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Usuário não encontrado"
            });
        }

        await usersRepository.deleteUser(id);
        
        res.clearCookie('access_token');
        
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
        const user = await usersRepository.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Usuário não encontrado"
            });
        }

        res.json({
            status: 200,
            data: {
                id: user.id,
                nome: user.nome,
                email: user.email
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

function validateRegisterPayload(body) {
    const errors = [];
    const allowedFields = ['nome', 'email', 'senha'];
    
    const extraFields = Object.keys(body).filter(field => !allowedFields.includes(field));
    if (extraFields.length > 0) {
        extraFields.forEach(field => {
            errors.push(`Campo '${field}' não é permitido`);
        });
    }
    
    if (!body.nome) {
        errors.push("O campo 'nome' é obrigatório");
    } else if (typeof body.nome !== 'string') {
        errors.push("O campo 'nome' deve ser uma string");
    } else if (body.nome.trim() === '') {
        errors.push("O campo 'nome' não pode estar vazio");
    }
    
    if (!body.email) {
        errors.push("O campo 'email' é obrigatório");
    } else if (typeof body.email !== 'string') {
        errors.push("O campo 'email' deve ser uma string");
    } else if (body.email.trim() === '') {
        errors.push("O campo 'email' não pode estar vazio");
    } else if (!isValidEmail(body.email)) {
        errors.push("Email inválido");
    }
    
    if (!body.senha) {
        errors.push("O campo 'senha' é obrigatório");
    } else if (typeof body.senha !== 'string') {
        errors.push("O campo 'senha' deve ser uma string");
    } else if (body.senha.trim() === '') {
        errors.push("O campo 'senha' não pode estar vazio");
    } else if (!isValidPassword(body.senha)) {
        errors.push("Senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais");
    }
    
    return errors;
}

function isValidPassword(password) {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

function isValidId(id) {
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId > 0;
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

module.exports = {
    register,
    login,
    logout,
    deleteUser,
    getMe
};