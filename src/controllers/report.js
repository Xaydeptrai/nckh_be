const sql = require("mssql");
const { connectToDB } = require("../configs/connect-db");
const { dbMSConfig, dbEUConfig, dbNAConfig } = require("../configs/db");

async function getTopProducts(year, server) {
  let pool;
  if (server === "na") {
    pool = await connectToDB(dbNAConfig);
  }
  if (server === "eu") {
    pool = await connectToDB(dbEUConfig);
  }
  if (server === "ms") {
    pool = await connectToDB(dbMSConfig);
  }
  try {
    const query = `
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
    await sql.close();
  }
}

async function totalSalesBySubcategory(
  year,
  queryServer,
  masterServer,
  masterServerPort
) {
  let pool;
  let db;
  if (queryServer === "na") {
    db = dbNAConfig;
  }
  if (queryServer === "eu") {
    db = dbEUConfig;
  }
  if (queryServer === "ms") {
    db = dbMSConfig;
  }
  const useLinkedServer = queryServer !== "ms";
  pool = await connectToDB(db);
  try {
    const query = `
            DECLARE @totalSales DECIMAL(18,2);
            DECLARE @year INT = @yearParam;
            
            -- Tính tổng doanh thu trước
            SELECT @totalSales = SUM(sod.LineTotal)
            FROM [${db.database}].[Sales].SalesOrderDetail sod
            JOIN [${
              db.database
            }].[Sales].SalesOrderHeader soh ON sod.SalesOrderID = soh.SalesOrderID
            WHERE (@year IS NULL OR YEAR(soh.OrderDate) = @year);
            
            -- Truy vấn chính
            SELECT 
                pc.Name AS Category,
                SUM(sod.LineTotal) AS TotalSales,
                CASE 
                    WHEN @totalSales > 0 THEN (SUM(sod.LineTotal) / @totalSales) * 100
                    ELSE 0
                END AS SalesPercentage
            FROM [${db.database}].[Sales].SalesOrderDetail sod
            JOIN [${
              db.database
            }].[Production].Product p ON sod.ProductID = p.ProductID
            ${
              useLinkedServer
                ? `JOIN [${masterServer},${masterServerPort}].Adventureworks2022.Production.ProductSubcategory ps 
                ON p.ProductSubcategoryID = ps.ProductSubcategoryID
            JOIN [${masterServer},${masterServerPort}].Adventureworks2022.Production.ProductCategory pc 
                ON ps.ProductCategoryID = pc.ProductCategoryID`
                : `JOIN Adventureworks2022.Production.ProductSubcategory ps 
                ON p.ProductSubcategoryID = ps.ProductSubcategoryID
            JOIN Adventureworks2022.Production.ProductCategory pc 
                ON ps.ProductCategoryID = pc.ProductCategoryID`
            }
            JOIN [${
              db.database
            }].[Sales].SalesOrderHeader soh ON sod.SalesOrderID = soh.SalesOrderID
            WHERE (@year IS NULL OR YEAR(soh.OrderDate) = @year)
            GROUP BY pc.Name
            ORDER BY pc.Name;
        `;

    const salesResult = await sql.query(query.replace(/@yearParam/g, year));
    return {
      Year: year,
      Data: salesResult.recordset,
    };
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
    return {
      Year: year,
      Data: [],
      Error: error.message,
    };
  } finally {
    await sql.close();
  }
}

async function totalSalesByYear(year, server) {
  let pool;
  if (server === "na") {
    pool = await connectToDB(dbNAConfig);
  }
  if (server === "eu") {
    pool = await connectToDB(dbEUConfig);
  }
  if (server === "ms") {
    pool = await connectToDB(dbMSConfig);
  }
  try {
    const query = `
      SELECT SUM(TotalDue) AS TotalSales
      FROM Sales.SalesOrderHeader
      ${year ? "WHERE YEAR(OrderDate) = @year" : ""};
    `;

    const result = await pool
      .request()
      .input("year", sql.Int, year ? parseInt(year) : null)
      .query(query);

    return {
      Year: year,
      TotalSales: result.recordset[0]?.TotalSales || 0,
    };
  } catch (error) {
    console.error("Lỗi truy vấn dữ liệu:", error);
    throw new Error("Lỗi truy vấn dữ liệu");
  } finally {
    await sql.close();
  }
}

module.exports = { getTopProducts, totalSalesBySubcategory, totalSalesByYear };
