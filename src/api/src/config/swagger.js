const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SEO/SEA Automation API',
            version: '1.0.0',
            description: 'API voor SEO en SEA automatisering',
            contact: {
                name: 'API Support',
                email: 'support@seo-sea-automation.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development server'
            },
            {
                url: 'https://api.seo-sea.local/api/v1',
                description: 'Production server'
            }
        ],
        components: {
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    description: 'Error message'
                                },
                                status: {
                                    type: 'integer',
                                    description: 'HTTP status code'
                                }
                            }
                        }
                    }
                },
                KeywordAnalysis: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['success'],
                            description: 'Response status'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                keywords: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'Lijst van geanalyseerde keywords'
                                },
                                analysis: {
                                    type: 'string',
                                    description: 'Analyse resultaat'
                                }
                            }
                        }
                    }
                },
                KeywordSuggestions: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['success'],
                            description: 'Response status'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                keyword: {
                                    type: 'string',
                                    description: 'Het originele keyword'
                                },
                                suggestions: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    },
                                    description: 'Lijst van keyword suggesties'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'] // Pad naar de route bestanden
};

const specs = swaggerJsdoc(options);

module.exports = { specs };
