const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Financial Guard API',
            version: '1.0.0',
            description: 'API para el control de finanzas personales, presupuestos y alcancías.',
        },
        servers: [{
            url: 'http://localhost:3000',
            description: 'Servidor de desarrollo',
        }, ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token'
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    apis: ['./src/routes/*.js'], // Aquí Swagger buscará los comentarios de documentación
};

const specs = swaggerJsdoc(options);
module.exports = specs;