const db = require('../db/db');
const bcrypt = require('bcryptjs');

async function create(usuario) {
    const { senha, ...dados } = usuario;
    const senhaHash = await bcrypt.hash(senha, 12);
    
    const dadosNormalizados = {
        ...dados,
        email: dados.email.toLowerCase(),
        senha: senhaHash
    };
    
    const [novoUsuario] = await db('usuarios')
        .insert(dadosNormalizados)
        .returning(['id', 'nome', 'email', 'created_at']);
    
    return novoUsuario;
}

async function findByEmail(email) {
    const emailNormalizado = email.toLowerCase();
    return await db('usuarios').where('email', emailNormalizado).first();
}

async function findById(id) {
    return await db('usuarios')
        .select('id', 'nome', 'email', 'created_at')
        .where({ id })
        .first();
}

async function verifyPassword(senhaPlain, senhaHash) {
    return await bcrypt.compare(senhaPlain, senhaHash);
}

async function deleteUser(id) {
    return await db('usuarios').where({ id }).del();
}

module.exports = {
    create,
    findByEmail,
    findById,
    verifyPassword,
    deleteUser
};