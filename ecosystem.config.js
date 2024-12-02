module.exports = {
  apps: [
    {
      name: "gateway",
      script: "./gateway/index.js",
      env: {
        GATEWAY_PORT: process.env.PORT || 3000,  // Usa el puerto asignado por Render
      }
    },
    {
      name: "auth-service",
      script: "./services/auth/index.js",
      env: {
        AUTH_PORT: process.env.PORT || 3001,  // Usa el puerto asignado por Render
      }
    },
    {
      name: "users-service",
      script: "./services/users/index.js",
      env: {
        USER_PORT: process.env.PORT || 3002,  // Usa el puerto asignado por Render
      }
    },
    {
      name: "tests-service",
      script: "./services/tests/index.js",
      env: {
        TESTS_PORT: process.env.PORT || 3003,  // Usa el puerto asignado por Render
      }
    },
  ]
};
