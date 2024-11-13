module.exports = {
    apps: [
      {
        name: "gateway",
        script: "./gateway/index.js",
      },
      {
        name: "auth-service",
        script: "./services/auth/index.js",
      },
      {
        name: "users-service",
        script: "./services/users/index.js",
      },
      {
        name: "tests-service",
        script: "./services/tests/index.js",
      },
    ]
  };
  