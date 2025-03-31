const express = require("express");
const { getTopProducts } = require("../controllers/Master/report");
const {
  getTopProductsDistribution,
} = require("../controllers/Distributor/report");

const ReportRoutes = () => {
  const router = express.Router();

  router.get("/ms/top-products-by-revenue", (req, res) => {
    const year = req.query.year;
    getTopProducts(year)
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/na/top-products-by-revenue", (req, res) => {
    const year = req.query.year;
    getTopProductsDistribution(year, "na")
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/eu/top-products-by-revenue", (req, res) => {
    const year = req.query.year;
    getTopProductsDistribution(year, "eu")
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  return router;
};

module.exports = ReportRoutes;
