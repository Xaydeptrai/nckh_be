const express = require("express");
const {
  getTopProducts,
  totalSalesBySubcategory,
  totalSalesByYear,
  totalSalesByCityCategory,
} = require("../controllers/report");
const { dbMSConfig } = require("../configs/db");

const ReportRoutes = () => {
  const router = express.Router();

  router.get("/ms/top-products-by-revenue", (req, res) => {
    const year = req.query.year;
    getTopProducts(year, "ms")
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/na/top-products-by-revenue", (req, res) => {
    const year = req.query.year;
    getTopProducts(year, "na")
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/eu/top-products-by-revenue", (req, res) => {
    const year = req.query.year;
    getTopProducts(year, "eu")
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/ms/total-sales-by-subcategory", (req, res) => {
    const year = req.query.year;
    totalSalesBySubcategory(year, "ms", dbMSConfig.server, 1433)
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/na/total-sales-by-subcategory", (req, res) => {
    const year = req.query.year;
    totalSalesBySubcategory(year, "na", dbMSConfig.server, 1433)
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/eu/total-sales-by-subcategory", (req, res) => {
    const year = req.query.year;
    totalSalesBySubcategory(year, "eu", dbMSConfig.server, 1433)
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/ms/total-sales-by-year", (req, res) => {
    const year = req.query.year;
    totalSalesByYear(year, "ms")
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/na/total-sales-by-year", (req, res) => {
    const year = req.query.year;
    totalSalesByYear(year, "na")
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/eu/total-sales-by-year", (req, res) => {
    const year = req.query.year;
    totalSalesByYear(year, "eu")
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/ms/total-sales-by-city-category", (req, res) => {
    const year = req.query.year;
    totalSalesByCityCategory(year, "ms", dbMSConfig.server, 1433)
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/na/total-sales-by-city-category", (req, res) => {
    const year = req.query.year;
    totalSalesByCityCategory(year, "na", dbMSConfig.server, 1433)
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  router.get("/eu/total-sales-by-city-category", (req, res) => {
    const year = req.query.year;
    console.log(process.env.DB_MS_SERVER);
    totalSalesByCityCategory(year, "eu", dbMSConfig.server, 1433)
      .then((data) => res.json(data))
      .catch((error) => res.status(500).json({ error: error.message }));
  });

  return router;
};

module.exports = ReportRoutes;
