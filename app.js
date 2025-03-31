const express = require("./src/frameworks/express");
const config = require("./src/configs/config");

const startServer = async () => {
  const app = express();

  const PORT = config.PORT;
  app.listen(PORT, () => console.log(`Service running on port ${PORT}`));
};

startServer();
