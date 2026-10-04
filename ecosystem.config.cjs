module.exports = {
  apps: [
    {
      name: "NetaBot",
      script: "bun",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
