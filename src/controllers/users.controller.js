// SERVICE
import usersService from "../services/users.service.js";
import ResponseClass from "../models/response.model.js";

// GET ALL USERS
const get = async (req, res, next) => {
  try {
    const dataResult = await usersService.getAll();
    if (dataResult.code === 200) {
      return res.status(200).json(dataResult);
    } else {
      return res.status(404).json(dataResult);
    }
  } catch (error) {
    console.error(`Error while getting users`, error.message);
    next(error);
  }
};

// GET USERS BY ID
const getbyid = async (req, res, next) => {
  try {
    const dataResult = await usersService.getById(req);
    if (dataResult.code === 200) {
      return res.status(200).json(dataResult);
    }
    return res.status(404).json(dataResult);
  } catch (err) {
    console.error(`Error while getting user by id`, err.message);
    next(err);
  }
};

// REGISTER FUNCTION
const register = async (req, res, next) => {
  try {
    res.json(await usersService.registerUsers(req.body));
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// LOGIN
const login = async (req, res, next) => {
  try {
    var loginResult = await usersService.loginUsers(req);
    // if login result is success
    if (loginResult.code == 200) {
      var responseSuccess = new ResponseClass.SuccessResponse();
      // return response cookie with refresh_token
      res.cookie("refreshToken", loginResult.refresh_token, {
        httpOnly: true,
        // maxAge: 24 * 60 * 60 * 1000,
      });
      responseSuccess.message = "Login Success";
      responseSuccess.data = {
        object: "authentication_token",
        userId: loginResult.userId,
        email: req.body.email,
        roles: loginResult.roles,
        authentication_token: loginResult.accessToken,
      };
      res.json(responseSuccess);
    } else {
      res.json(loginResult);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//LOGOUT
const logout = async (req, res, next) => {
  try {
    var logoutResult = await usersService.logoutUsers(req.headers.cookie);
    if (logoutResult.code == 200) {
      res.clearCookie("refreshToken");
    }
    res.json(logoutResult);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// PREDICT CARDIOVASCULAR
const predict = async (req, res, next) => {
  try {
    const predictResult = await usersService.predict(req);
    if (predictResult.code === 200) {
      return res.status(200).json(predictResult);
    }
    return res.status(predictResult.code).json(predictResult);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// EXPORT
export default {
  get,
  getbyid,
  login,
  register,
  logout,
  predict,
};
