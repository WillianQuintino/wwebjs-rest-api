import swaggerJsdoc from 'swagger-jsdoc';
import { name, version, description } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: name,
      version,
      description,
    },
    servers: [
      {
        url: 'http://localhost:3000', // Altere para a URL do seu servidor
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Caminhos para os arquivos com anotações
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
