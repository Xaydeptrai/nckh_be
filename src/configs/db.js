const dbMSConfig = {
  user: process.env.DB_MS_USER || "sa",
  password: process.env.DB_MS_PASSWORD || "123",
  server: process.env.DB_MS_SERVER || "192.168.1.5",
  database: "AdventureWorks2022",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    port: 1433,
  },
};

const dbNAConfig = {
  user: process.env.DB_NA_USER || "sa",
  password: process.env.DB_NA_PASSWORD || "123",
  server: process.env.DB_NA_SERVER || "192.168.1.5",
  database: "SalesNA",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    port: 1436,
  },
};

const dbEUConfig = {
  user: process.env.DB_EU_USER || "sa",
  password: process.env.DB_EU_PASSWORD || "123",
  server: process.env.DB_EU_SERVER || "192.168.1.5",
  database: "SalesEU",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    port: 1435,
  },
};

module.exports = { dbMSConfig, dbEUConfig, dbNAConfig };
