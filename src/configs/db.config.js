// library
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// dbname, username, password
const db = new Sequelize("nutriastdb", "admin", "nutriast123", {
  host: "nutriast-db.ctqi5mhthuyw.ap-southeast-1.rds.amazonaws.com",
  dialect: "mysql",
});

/* Uncommand to sync table design */

// db.sync({ alter: true })
//   .then(() => {
//     console.log("Tabel berhasil di sinkronisasi");
//   })
//   .catch((error) => {
//     console.error("Terjadi kesalahan:", error);
//   });

export default db;
