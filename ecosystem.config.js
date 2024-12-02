module.exports = {
  apps: [
    {
      name: "gateway",
      script: "./gateway/index.js",
      env: {
        PORT: 3000
      }
    },
    {
      name: "auth-service",
      script: "./services/auth/index.js",
      env: {
        PORT: 3001
      }
    },
    {
      name: "users-service",
      script: "./services/users/index.js",
      env: {
        PORT: 3002
      }
    },
    {
      name: "tests-service",
      script: "./services/tests/index.js",
      env: {
        PORT: 3003
      }
    },
  ]
};
