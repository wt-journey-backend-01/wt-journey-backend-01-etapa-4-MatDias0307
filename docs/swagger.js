const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API do Departamento de Polícia',
            version: '1.0.0',
            description: 'API para gerenciamento de casos e agentes policiais',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor local',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Agente: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID único do agente'
                        },
                        nome: {
                            type: 'string',
                            description: 'Nome completo do agente'
                        },
                        dataDeIncorporacao: {
                            type: 'string',
                            format: 'date',
                            description: 'Data de incorporação no formato YYYY-MM-DD'
                        },
                        cargo: {
                            type: 'string',
                            enum: ['delegado', 'inspetor', 'detetive'],
                            description: 'Cargo do agente'
                        }
                    },
                    required: ['nome', 'dataDeIncorporacao', 'cargo']
                },
                Caso: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID único do caso'
                        },
                        titulo: {
                            type: 'string',
                            description: 'Título do caso'
                        },
                        descricao: {
                            type: 'string',
                            description: 'Descrição detalhada do caso'
                        },
                        status: {
                            type: 'string',
                            enum: ['aberto', 'solucionado'],
                            description: 'Status atual do caso'
                        },
                        agente_id: {
                            type: 'integer',
                            description: 'ID do agente responsável pelo caso'
                        },
                        data: {
                            type: 'string',
                            format: 'date',
                            description: 'Data do caso no formato YYYY-MM-DD'
                        }
                    },
                    required: ['titulo', 'descricao', 'status', 'agente_id']
                },
                Usuario: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID único do usuário'
                        },
                        nome: {
                            type: 'string',
                            description: 'Nome completo do usuário'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário'
                        }
                    },
                    required: ['nome', 'email']
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'integer',
                            description: 'Código do status HTTP'
                        },
                        message: {
                            type: 'string',
                            description: 'Mensagem de erro'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Lista de erros detalhados'
                        },
                        error: {
                            type: 'string',
                            description: 'Mensagem de erro interno'
                        }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        access_token: {
                            type: 'string',
                            description: 'Token JWT para autenticação'
                        }
                    }
                }
            },
            responses: {
                Unauthorized: {
                    description: 'Não autorizado',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                NotFound: {
                    description: 'Recurso não encontrado',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                BadRequest: {
                    description: 'Dados inválidos',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                InternalError: {
                    description: 'Erro interno no servidor',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js'],
};

function setupSwagger(app) {
    const specs = swaggerJsdoc(swaggerOptions);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;