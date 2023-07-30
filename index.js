import express from "express";
import router from "./src/routes/index.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
// import cors from 'cors'
// import dotenv from "dotenv";
// dotenv.config();
import db from './src/configs/db.config.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// AppRUN

// app.use(cors({
//   origin: '*',
//   allowedHeaders: ['Content-Type', 'Authorization']
// }))

app.use(router);
app.use(cookieParser())
app.use(express.json())
app.get('/', (req, res) => {
  res.json({'message': 'ok'});
})

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  
  return;
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening at port : ${port}`)
});
