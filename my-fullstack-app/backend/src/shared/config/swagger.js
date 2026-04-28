const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ManageWork API",
      version: "1.0.0",
      description: "API documentation for ManageWork backend application",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8888}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/server.js"], // paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  // Swagger page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger docs available at http://localhost:${process.env.PORT || 8888}/api-docs`);
};

module.exports = { swaggerDocs, swaggerSpec };

