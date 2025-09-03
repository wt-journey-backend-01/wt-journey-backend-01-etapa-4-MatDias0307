const db = require('../db/db');
const bcrypt = require('bcryptjs');

async function findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    return await db("usuarios").where({ email: normalizedEmail }).first();
}

async function findById(id) {
    return await db('usuarios').select('id', 'nome', 'email').where({ id: Number(id) }).first();
}

async function create(userData) {
    const { senha, ...data } = userData;
    const passwordHash = await bcrypt.hash(senha, 12);
    
    const normalizedData = {
        ...data,
        email: data.email.trim().toLowerCase(),
        senha: passwordHash
    };
    
    const [newUser] = await db('usuarios').insert(normalizedData).returning(['id', 'nome', 'email']);
    
    return newUser;
}

async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

async function deleteUser(id) {
    return await db('usuarios').where({ id: Number(id) }).del();
}

module.exports = {
    findByEmail,
    findById,
    create,
    verifyPassword,
    deleteUser
};