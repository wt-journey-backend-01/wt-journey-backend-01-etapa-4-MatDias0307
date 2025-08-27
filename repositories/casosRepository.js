const db = require('../db/db');

async function findById(id) {
    return await db('casos').where({ id }).first();
}

async function create(caso) {
    const { id: _, ...dados } = caso;
    
    const [novoCaso] = await db('casos')
        .insert(dados)
        .returning('*');
    
    return novoCaso;
}

async function update(id, casoAtualizado) {
    const { id: _, ...dadosSemId } = casoAtualizado;
    
    const [casoAtualizadoDb] = await db('casos')
        .where({ id })
        .update(dadosSemId)
        .returning('*');
    
    return casoAtualizadoDb || null;
}

async function remove(id) {
    await db('casos').where({ id }).del();
}

async function searchWithFilters({ agente_id, status, q }) {
    const validAgenteId = agente_id && !isNaN(Number(agente_id)) ? Number(agente_id) : null;

    const cleanStatus = status ? status.trim().toLowerCase() : null;

    const cleanQuery = q ? q.trim() : null;
    
    return await db('casos')
        .modify(function(queryBuilder) {
            if (validAgenteId !== null) {
                queryBuilder.where('agente_id', validAgenteId);
            }
            if (cleanStatus) {
                queryBuilder.where('status', cleanStatus);
            }
            if (cleanQuery) {
                const escapedQuery = cleanQuery.replace(/[%_]/g, '\\$&');
                queryBuilder.where(function() {
                    this.where('titulo', 'ilike', `%${escapedQuery}%`)
                        .orWhere('descricao', 'ilike', `%${escapedQuery}%`);
                });
            }
        });
}

module.exports = {
    findById,
    create,
    update,
    remove,
    searchWithFilters
};