// library
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// dbname, username, password
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
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