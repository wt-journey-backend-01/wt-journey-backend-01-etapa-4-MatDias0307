const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuariosRepository');

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Token de acesso requerido"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await usuariosRepository.findById(decoded.id);
        
        if (!usuario) {
            return res.status(403).json({
                status: 403,
                message: "Usuário não encontrado"
            });
        }

        req.user = usuario;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 401,
                message: "Token expirado"
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                status: 403,
                message: "Token inválido"
            });
        }

        return res.status(500).json({
            status: 500,
            message: "Erro na autenticação"
        });
    }
}

module.exports = {
    authenticateToken
};