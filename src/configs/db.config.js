// library
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// dbname, username, password
const db = new Sequelize("nutriastdb", "root", "nutriastapi28", {
  host: "34.101.40.63",
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
