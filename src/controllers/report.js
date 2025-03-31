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
          DECLARE @StartTime DATETIME = GETDATE();
          DECLARE @RequestID INT = @@SPID;

          SELECT TOP 10 
            p.Name AS ProductName,
            SUM(sod.LineTotal) AS TotalRevenue
          FROM sales.SalesOrderDetail sod
          JOIN production.Product p ON sod.ProductID = p.ProductID
          JOIN sales.SalesOrderHeader soh ON sod.SalesOrderID = soh.SalesOrderID
          ${year ? "WHERE YEAR(soh.OrderDate) = @year" : ""}
          GROUP BY p.Name
          ORDER BY TotalRevenue DESC;

          SELECT 
          cpu_time, total_elapsed_time
          FROM sys.dm_exec_requests
          WHERE session_id = @RequestID;
      `;

    const result = await pool
      .request()
      .input("year", sql.Int, year ? parseInt(year) : null)
      .query(query);

    return {
      Year: year,
      TopProducts: result.recordset,
      CPUTime: result.recordsets[1][0]?.cpu_time || "N/A",
      ElapsedTime: result.recordsets[1][0]?.total_elapsed_time || "N/A",
    };
  } catch (error) {
    console.error("Lỗi truy vấn dữ liệu:", error);
    throw new Error("Lỗi truy vấn dữ liệu");
  } finally {
    await pool.close();
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

          DECLARE @StartTime DATETIME = GETDATE();
          DECLARE @RequestID INT = @@SPID;

            DECLARE @totalSales DECIMAL(18,2);
            
            -- Tính tổng doanh thu trước
            SELECT @totalSales = SUM(sod.LineTotal)
            FROM [${db.database}].[Sales].SalesOrderDetail sod
            JOIN [${
              db.database
            }].[Sales].SalesOrderHeader soh ON sod.SalesOrderID = soh.SalesOrderID
            ${year ? "WHERE YEAR(soh.OrderDate) =" + year : ""}
            
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
            ${year ? "WHERE YEAR(soh.OrderDate) =" + year : ""}
            GROUP BY pc.Name
            ORDER BY pc.Name;

                  SELECT 
        cpu_time, total_elapsed_time
      FROM sys.dm_exec_requests
      WHERE session_id = @RequestID;
        `;

    const result = await sql.query(query);
    return {
      Year: year || "all",
      Data: result.recordset,
      CPUTime: result.recordsets[1][0]?.cpu_time || "N/A",
      ElapsedTime: result.recordsets[1][0]?.total_elapsed_time || "N/A",
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
      DECLARE @StartTime DATETIME = GETDATE();
      DECLARE @RequestID INT = @@SPID;

      SELECT SUM(TotalDue) AS TotalSales
      FROM Sales.SalesOrderHeader
      ${year ? "WHERE YEAR(OrderDate) = @year" : ""};

      SELECT cpu_time, total_elapsed_time
      FROM sys.dm_exec_requests
      WHERE session_id = @RequestID;
    `;

    const result = await pool
      .request()
      .input("year", sql.Int, year ? parseInt(year) : null)
      .query(query);

    return {
      Year: year,
      TotalSales: result.recordset[0]?.TotalSales || 0,
      CPUTime: result.recordsets[1][0]?.cpu_time || "N/A",
      ElapsedTime: result.recordsets[1][0]?.total_elapsed_time || "N/A",
    };
  } catch (error) {
    console.error("Lỗi truy vấn dữ liệu:", error);
    throw new Error("Lỗi truy vấn dữ liệu");
  } finally {
    await sql.close();
  }
}

async function totalSalesByCityCategory(
  year,
  queryServer,
  masterServer,
  masterServerPort
) {
  let pool;
  let db;

  // Chọn config database dựa trên queryServer
  if (queryServer === "na") {
    db = dbNAConfig;
  } else if (queryServer === "eu") {
    db = dbEUConfig;
  } else if (queryServer === "ms") {
    db = dbMSConfig;
  }

  const useLinkedServer = queryServer !== "ms";
  pool = await connectToDB(db);

  try {
    const query = `
      DECLARE @StartTime DATETIME = GETDATE();
      DECLARE @RequestID INT = @@SPID;

      WITH SalesByCityCategory AS (
        SELECT 
          a.City,
          pc.Name AS Category,
          SUM(sod.LineTotal) AS TotalRevenue
        FROM [${db.database}].[Sales].SalesOrderDetail sod
        JOIN [${
          db.database
        }].[Sales].SalesOrderHeader soh ON sod.SalesOrderID = soh.SalesOrderID
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
        }].[Person].Address a ON soh.ShipToAddressID = a.AddressID
        ${year ? "WHERE YEAR(soh.OrderDate) = @yearParam" : ""}
        GROUP BY a.City, pc.Name
      ),
      TopCities AS (
        SELECT TOP 10 City
        FROM SalesByCityCategory
        GROUP BY City
        ORDER BY SUM(TotalRevenue) DESC
      )
      SELECT s.City, s.Category, s.TotalRevenue
      FROM SalesByCityCategory s
      WHERE s.City IN (SELECT City FROM TopCities)
      ORDER BY s.City, s.Category;

      SELECT cpu_time, total_elapsed_time
      FROM sys.dm_exec_requests
      WHERE session_id = @RequestID;
    `;

    const request = pool.request();
    if (year) {
      request.input("yearParam", sql.Int, parseInt(year)); // Chỉ thêm tham số nếu year có giá trị
    }

    const result = await request.query(query);

    return {
      Year: year,
      Data: result.recordset,
      CPUTime: result.recordsets[1][0]?.cpu_time || "N/A",
      ElapsedTime: result.recordsets[1][0]?.total_elapsed_time || "N/A",
    };
  } catch (error) {
    console.error("Lỗi khi truy vấn dữ liệu:", error);
    return {
      Year: year,
      Data: [],
      Error: error.message,
    };
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

module.exports = {
  getTopProducts,
  totalSalesBySubcategory,
  totalSalesByYear,
  totalSalesByCityCategory,
};
