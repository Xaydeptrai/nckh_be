const sql = require("mssql");
const { connectToDB } = require("../configs/connect-db");
const { dbMSConfig, dbEUConfig, dbNAConfig } = require("../configs/db");

async function getOrderList(page, limit, server, year, searchParams) {
  let pool;
  if (server === "na") {
    pool = await connectToDB(dbNAConfig);
  } else if (server === "eu") {
    pool = await connectToDB(dbEUConfig);
  } else if (server === "ms") {
    pool = await connectToDB(dbMSConfig);
  } else {
    throw new Error("Server không hợp lệ");
  }

  try {
    const offset = (page - 1) * limit;

    const query = `
        DECLARE @StartTime DATETIME = GETDATE();
        DECLARE @RequestID INT = @@SPID;

        SELECT 
            [SalesOrderID],
            [RevisionNumber],
            [OrderDate],
            [CustomerID],
            [TotalDue],
            [Status],
            [ModifiedDate]
        FROM [Sales].[SalesOrderHeader]
        WHERE (@year IS NULL OR YEAR([OrderDate]) = @year) 
          AND (@SalesOrderID IS NULL OR [SalesOrderID] = @SalesOrderID)
          AND (@CustomerID IS NULL OR [CustomerID] = @CustomerID)
          AND (@Status IS NULL OR [Status] = @Status)
        ORDER BY [OrderDate] DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        SELECT cpu_time, total_elapsed_time
        FROM sys.dm_exec_requests
        WHERE session_id = @RequestID;
      `;

    const request = pool.request();
    request.input("year", sql.Int, year || null);
    request.input("SalesOrderID", sql.Int, searchParams?.SalesOrderID || null);
    request.input("CustomerID", sql.Int, searchParams?.CustomerID || null);
    request.input("Status", sql.VarChar, searchParams?.Status || null);
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const result = await request.query(query);

    return {
      Page: page,
      Limit: limit,
      Orders: result.recordset,
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

async function updateOrderStatus(salesOrderID, status, server) {
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
      UPDATE [Sales].[SalesOrderHeader]
      SET [Status] = @status
      WHERE [SalesOrderID] = @salesOrderID;
    `;

    const request = pool.request();
    request.input("salesOrderID", sql.Int, salesOrderID);
    request.input("status", sql.Int, status);

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null;
    }

    return { salesOrderID, status };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    throw new Error("Lỗi khi cập nhật trạng thái đơn hàng");
  } finally {
    await pool.close();
  }
}

async function getOrderDetail(salesOrderID, server) {
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

  const useLinkedServer = server !== "ms";
  const linkedServerPrefix = `[${dbMSConfig.server},${dbMSConfig.options.port}]`;

  try {
    const query = `
    DECLARE @StartTime DATETIME = GETDATE();
    DECLARE @RequestID INT = @@SPID;

    SELECT 
      soh.SalesOrderID,
      soh.OrderDate,
      soh.CustomerID,
      COALESCE(p.FirstName + ' ' + p.LastName, 'Unknown') AS CustomerName,
      soh.TotalDue,
      soh.Status,
      sod.ProductID,
      prd.Name AS ProductName,
      sod.OrderQty,
      sod.UnitPrice,
      sod.LineTotal
    FROM Sales.SalesOrderHeader soh
    JOIN Sales.SalesOrderDetail sod ON soh.SalesOrderID = sod.SalesOrderID
    JOIN Production.Product prd ON sod.ProductID = prd.ProductID
    JOIN ${
      useLinkedServer
        ? `OPENQUERY(${linkedServerPrefix}, 'SELECT CustomerID, PersonID FROM Adventureworks2022.Sales.Customer')`
        : "Sales.Customer"
    } c 
    ON soh.CustomerID = c.CustomerID
    JOIN ${
      useLinkedServer
        ? `OPENQUERY(${linkedServerPrefix}, 'SELECT BusinessEntityID, FirstName, LastName FROM Adventureworks2022.Person.Person')`
        : "Person.Person"
    } p 
    ON c.PersonID = p.BusinessEntityID
    WHERE soh.SalesOrderID = @salesOrderID;

    SELECT cpu_time, total_elapsed_time
    FROM sys.dm_exec_requests
    WHERE session_id = @RequestID;
  `;

    const result = await pool
      .request()
      .input("salesOrderID", sql.Int, salesOrderID)
      .query(query);

    return {
      orderDetails: result.recordset,
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

module.exports = { getOrderList, updateOrderStatus, getOrderDetail };
