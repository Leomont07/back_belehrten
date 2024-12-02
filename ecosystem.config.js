module.exports = {
  apps: [
    {
      name: "gateway",
      script: "./gateway/index.js",
      env: {
       GATEWAY_PORT: process.env.GATEWAY_PORT,
      }
    },
    {
      name: "auth-service",
      script: "./services/auth/index.js",
      env: {
       AUTH_PORT: process.env.AUTH_PORT,
      }
    },
    {
      name: "users-service",
      script: "./services/users/index.js",
      env: {
       USER_PORT: process.env.USER_PORT,
      }
    },
    {
      name: "tests-service",
      script: "./services/tests/index.js",
      env: {
       TESTS_PORT: process.env.TESTS_PORT,
      }
    },
  ]
};
