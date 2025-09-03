const db = require('../db/db');

async function findAll() {
    const cases = await db("casos");
    return cases.map(mapCase);
}
  
async function findById(id) {
    const found = await db("casos").where({ id: Number(id) }).first();
    return found ? mapCase(found) : null;
}

async function create(caseData) {
    const [created] = await db("casos").insert(caseData).returning("*");
    return mapCase(created);
}

async function update(id, updatedData) {
    const [updated] = await db("casos").where({ id: Number(id) }).update(updatedData).returning("*");
    return updated ? mapCase(updated) : null;
}

async function searchWithFilters({ agente_id, status, q }) {
    const validAgentId = agente_id && !isNaN(Number(agente_id)) ? Number(agente_id) : null;
    const cleanStatus = status ? status.trim().toLowerCase() : null;
    const cleanQuery = q ? q.trim() : null;
    
    const cases = await db('casos')
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
    
    return cases.map(mapCase);
}

function mapCase(caseData) {
    const formattedCase = { ...caseData };
    
    if (caseData.data) {
        formattedCase.data = formatDate(caseData.data);
    }
    
    return formattedCase;
}

function formatDate(date) {
    return new Date(date).toISOString().split("T")[0];
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
    searchWithFilters
}