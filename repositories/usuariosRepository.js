const db = require('../db/db');
const bcrypt = require('bcryptjs');

async function create(usuario) {
    const { senha, ...dados } = usuario;
    const senhaHash = await bcrypt.hash(senha, 12);
    
    const [novoUsuario] = await db('usuarios')
        .insert({ ...dados, senha: senhaHash })
        .returning(['id', 'nome', 'email', 'created_at']);
    
    return novoUsuario;
}

async function findByEmail(email) {
    return await db('usuarios').where({ email }).first();
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