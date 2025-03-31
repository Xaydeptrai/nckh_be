const express = require("express");
const {
  getOrderList,
  updateOrderStatus,
  getOrderDetail,
} = require("../controllers/order");

const OrderRoutes = () => {
  const router = express.Router();

  router.get("/ms", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const year = req.query.year || null;
      const searchParams = {
        SalesOrderID: req.query.SalesOrderID || null,
        CustomerID: req.query.CustomerID || null,
        Status: req.query.Status || null,
      };

      const result = await getOrderList(page, limit, "ms", year, searchParams);

      res.json(result);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      res.status(500).json({ error: "Lỗi khi lấy dữ liệu" });
    }
  });

  router.get("/na", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const year = req.query.year || null;
      const searchParams = {
        SalesOrderID: req.query.SalesOrderID || null,
        CustomerID: req.query.CustomerID || null,
        Status: req.query.Status || null,
      };

      const result = await getOrderList(page, limit, "na", year, searchParams);

      res.json(result);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      res.status(500).json({ error: "Lỗi khi lấy dữ liệu" });
    }
  });

  router.get("/eu", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const year = req.query.year || null;
      const searchParams = {
        SalesOrderID: req.query.SalesOrderID || null,
        CustomerID: req.query.CustomerID || null,
        Status: req.query.Status || null,
      };

      const result = await getOrderList(page, limit, "eu", year, searchParams);

      res.json(result);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      res.status(500).json({ error: "Lỗi khi lấy dữ liệu" });
    }
  });

  router.put("/ms/:id", async (req, res) => {
    try {
      const salesOrderID = req.params.id;

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
      }

      const result = await updateOrderStatus(salesOrderID, status, "ms");

      if (!result) {
        return res.status(404).json({ error: "Đơn hàng không tồn tại" });
      }

      res.json({ message: "Trạng thái đơn hàng đã được cập nhật", result });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đơn hàng" });
    }
  });

  router.put("/eu/:id", async (req, res) => {
    try {
      const salesOrderID = req.params.id;

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
      }

      const result = await updateOrderStatus(salesOrderID, status, "eu");

      if (!result) {
        return res.status(404).json({ error: "Đơn hàng không tồn tại" });
      }

      res.json({ message: "Trạng thái đơn hàng đã được cập nhật", result });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đơn hàng" });
    }
  });

  router.put("/na/:id", async (req, res) => {
    try {
      const salesOrderID = req.params.id;

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
      }

      const result = await updateOrderStatus(salesOrderID, status, "na");

      if (!result) {
        return res.status(404).json({ error: "Đơn hàng không tồn tại" });
      }

      res.json({ message: "Trạng thái đơn hàng đã được cập nhật", result });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đơn hàng" });
    }
  });

  router.get("/ms/:id", async (req, res) => {
    try {
      const salesOrderID = req.params.id;

      // Kiểm tra nếu salesOrderID không hợp lệ
      if (!salesOrderID) {
        return res.status(400).json({ error: "SalesOrderID không hợp lệ" });
      }

      // Gọi hàm lấy chi tiết đơn hàng
      const result = await getOrderDetail(salesOrderID, "ms");

      if (!result) {
        return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
      }

      res.json({ message: "Lấy thông tin đơn hàng thành công", data: result });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đơn hàng:", error);
      res.status(500).json({ error: "Lỗi khi lấy thông tin đơn hàng" });
    }
  });

  router.get("/na/:id", async (req, res) => {
    try {
      const salesOrderID = req.params.id;

      // Kiểm tra nếu salesOrderID không hợp lệ
      if (!salesOrderID) {
        return res.status(400).json({ error: "SalesOrderID không hợp lệ" });
      }

      // Gọi hàm lấy chi tiết đơn hàng
      const result = await getOrderDetail(salesOrderID, "na");

      if (!result) {
        return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
      }

      res.json({
        message: "Lấy thông tin đơn hàng thành công",
        data: result,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đơn hàng:", error);
      res.status(500).json({ error: "Lỗi khi lấy thông tin đơn hàng" });
    }
  });

  router.get("/eu/:id", async (req, res) => {
    try {
      const salesOrderID = req.params.id;

      // Kiểm tra nếu salesOrderID không hợp lệ
      if (!salesOrderID) {
        return res.status(400).json({ error: "SalesOrderID không hợp lệ" });
      }

      // Gọi hàm lấy chi tiết đơn hàng
      const result = await getOrderDetail(salesOrderID, "eu");

      if (!result) {
        return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
      }

      res.json({
        message: "Lấy thông tin đơn hàng thành công",
        data: result,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin đơn hàng:", error);
      res.status(500).json({ error: "Lỗi khi lấy thông tin đơn hàng" });
    }
  });

  return router;
};

module.exports = OrderRoutes;
