import swaggerJsdoc from "swagger-jsdoc";
const definition = {
  openapi: "3.0.0",
  info: {
    title: "chefswap",
    version: "1.0.0",
    description: "swap ... chefs?",
    license: {
      name: "Licensed Under MIT",
      url: "https://spdx.org/licenses/MIT.html",
    },
    contact: {
      name: "chefswap",
      email: "contact@chefswap.ca",
      url: "chefswap.ca",
    },
  },
};

const options = {
  definition,
  // Paths to files containing OpenAPI definitions
  apis: ["./server/routes/*.js"],
};
export const swaggerSpecs = swaggerJsdoc(options);
