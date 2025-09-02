const db = require('../db/db');

async function findAll() {
    const cases = await db("casos");
    return cases;
}
  
async function findById(id) {
    const found = await db("casos").where({ id: Number(id) }).first();
    return found || null;
}

async function create(caseData) {
    const [created] = await db("casos").insert(caseData).returning("*");
    return created;
}

async function update(updatedData, id) {
    const [updated] = await db("casos").where({ id: Number(id) }).update(updatedData).returning("*");
    return updated || null;
}

async function remove(id) {
    const deleted = await db("casos").where({ id: Number(id) }).del();
    return deleted;
}

async function searchWithFilters({ agente_id, status, q }) {
    const validAgentId = agente_id && !isNaN(Number(agente_id)) ? Number(agente_id) : null;
    const cleanStatus = status ? status.trim().toLowerCase() : null;
    const cleanQuery = q ? q.trim() : null;
    
    return await db('casos')
        .modify(function(queryBuilder) {
            if (validAgentId !== null) {
                queryBuilder.where('agente_id', validAgentId);
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
    findAll,
    findById,
    create,
    update,
    remove,
    searchWithFilters
};