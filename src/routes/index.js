// IMPORT LIBRARY
import express from "express";
// JWT
import { verifyToken } from "../middlewares/VerifyToken.js";
// CONTROLLER
import usersController from "../controllers/users.controller.js";
import intakeusersController from "../controllers/intakeusers.controller.js";
import tkpiController from "../controllers/tkpi.controller.js";

// ROUTER
const router = express.Router();

//UNTUK DEPLOY
/* users */
router.get("/users", verifyToken, usersController.get);
router.get("/users/:userId", verifyToken, usersController.getbyid);
router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.delete("/logout", usersController.logout);
router.post("/predict/:userId", verifyToken, usersController.predict);
/* intakeusers */
router.get("/intakeusers", verifyToken, intakeusersController.get);
router.get("/intakeusers/:intakeUserId", verifyToken, intakeusersController.getbyid);
router.get("/intakeusershistory/:intakeUserId", verifyToken, intakeusersController.gethistory);
router.post("/intakeusers/:userId", verifyToken, intakeusersController.create);
router.get("/foodlist", tkpiController.get)
router.post("/intakeuserstkpi/:userId", tkpiController.create);

// UNTUK TEST LOCAL
/* users */
// router.get("/users", usersController.get);
// router.get("/users/:userId", usersController.getbyid);
// router.post("/register", usersController.register);
// router.post("/login", usersController.login);
// router.delete("/logout", usersController.logout);
// router.post("/predict/:userId", usersController.predict);
// /* intakeusers */
// router.get("/intakeusers", intakeusersController.get);
// router.get("/intakeusers/:intakeUserId", intakeusersController.getbyid);
// router.get("/intakeusershistory/:intakeUserId", intakeusersController.gethistory);
// router.post("/intakeusers/:userId", intakeusersController.create);

// /* TKPI API */
// router.get("/foodlist", tkpiController.get)
// router.post("/intakeuserstkpi/:userId", tkpiController.create);


// EXPORT
export default router;