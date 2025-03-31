const express = require("express");
const cors = require("cors");
const ReportRoutes = require("../routes/report");
const OrderRoutes = require("../routes/order");

module.exports = () => {
  const app = express();
  app.use(express.json());

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  app.use("/api/report", ReportRoutes());
  app.use("/api/order", OrderRoutes());

  app.use((req, res) => {
    res.status(404).send("undefined");
  });

  return app;
};
