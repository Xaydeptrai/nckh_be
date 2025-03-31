const sql = require("mssql");
const { connectToDB } = require("../../configs/connect-db");
const { dbMSConfig } = require("../../configs/db");

async function getTopProducts(year) {
  let pool;
  try {
    pool = await connectToDB(dbMSConfig);

    let query = `
          SELECT TOP 10 
            p.Name AS ProductName,
            SUM(sod.LineTotal) AS TotalRevenue
          FROM sales.SalesOrderDetail sod
          JOIN production.Product p ON sod.ProductID = p.ProductID
          JOIN sales.SalesOrderHeader soh ON sod.SalesOrderID = soh.SalesOrderID
          ${year ? "WHERE YEAR(soh.OrderDate) = @year" : ""}
          GROUP BY p.Name
          ORDER BY TotalRevenue DESC;
      `;

    const result = await pool
      .request()
      .input("year", sql.Int, year ? parseInt(year) : null)
      .query(query);

    return {
      Year: year,
      TopProducts: result.recordset,
    };
  } catch (error) {
    console.error("Lỗi truy vấn dữ liệu:", error);
    throw new Error("Lỗi truy vấn dữ liệu");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

module.exports = { getTopProducts };
