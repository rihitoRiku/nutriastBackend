// library
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
// model
import { Users } from "../models/users.model.js";
// response
import ResponseClass from "../models/response.model.js";

// GET ALL USERS
async function getAll() {
  try {
    const dbResult = await Users.findAll({});
    const responseSuccess = new ResponseClass.SuccessResponse(200, "success", "Fetching users successfully!", dbResult);
    return responseSuccess;
  } catch (error) {
    console.error(error);
    const responseError = new ResponseClass.ErrorResponse(400, "failed", "Error fetching users!");
    return responseError;
  }
}

// GET USER BY ID
async function getById(request) {
  // Create response objects
  var responseError = new ResponseClass.ErrorResponse();
  var responseSuccess = new ResponseClass.SuccessResponse();

  // Extract userId from request parameters
  const { userId } = request.params;

  try {
    // Find the user in the database by userId
    const dbResult = await Users.findOne({
      where: { id: userId },
      attributes: [
        "username",
        "email",
        "gender",
        "birthdate",
        "height",
        "weight",
        "fatneed",
        "proteinneed",
        "caloryneed",
        "fiberneed",
        "carbohidrateneed",
        "smoke",
        "alcho",
        "active",
        "cardiovascular",
      ],
    });

    // Capitalize the first letter of the gender
    const gender =
      dbResult.gender.charAt(0).toUpperCase() + dbResult.gender.slice(1);

    // Calculate age based on birthdate
    const birthdate = new Date(dbResult.birthdate);
    const ageDiffMs = Date.now() - birthdate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Set success response properties
    responseSuccess.code = 200;
    responseSuccess.status = "success";
    responseSuccess.message = "Fetching user successfully!";
    responseSuccess.data = { ...dbResult.toJSON(), gender, age };
    return responseSuccess;
  } catch (err) {
    console.error(err);

    // Set error response properties
    responseError.code = 400;
    responseError.status = "failed";
    responseError.message = "Error fetching user!";
    return responseError;
  }
}

// PREDICT CARDIOVASCULAR
async function predict(request) {
  // Create response objects
  var responseError = new ResponseClass.ErrorResponse();
  var responseSuccess = new ResponseClass.SuccessResponse();

  const { userId } = request.params;
  const userdata = await Users.findOne({
    where: { id: userId },
  });

  // Check if any required fields are null
  if (
    request.body.cholesterol == null ||
    request.body.gluc == null ||
    request.body.ap_hi == null ||
    request.body.ap_lo == null ||
    request.body.smoke == null ||
    request.body.alco == null ||
    request.body.active == null
  ) {
    responseError.code = 400;
    responseError.status = "failed";
    responseError.message = "Please fill all field correctly!";
    return responseError;
  } else {
    const birthdate = new Date(userdata.birthdate);
    const ageDiffMs = Date.now() - birthdate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    let gender = 0;
    if (userdata.gender == "male") {
      gender = 1;
    } else if (userdata.gender == "female") {
      gender = 2;
    }
    const data = {
      age: age,
      gender: gender,
      height: userdata.height,
      weight: userdata.weight,
      ap_hi: request.body.ap_hi,
      ap_lo: request.body.ap_lo,
      cholesterol: request.body.cholesterol,
      gluc: request.body.gluc,
      smoke: request.body.smoke,
      alco: request.body.alco,
      active: request.body.active,
    };

    try {
      // Make a POST request to the prediction API
      const response = await fetch(
        "https://nutriastml-2qo27ggsha-et.a.run.app/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const jsonData = await response.json();
      let cardiovascular;
      if (jsonData.prediction == 1) {
        cardiovascular = "Aware";
      } else if (jsonData.prediction == 0) {
        cardiovascular = "Safe";
      }

      // Update the database with prediction data
      const updateValues = {
        cholesterol: request.body.cholesterol,
        glucose: request.body.gluc,
        cardiovascular: cardiovascular,
        smoke: request.body.smoke,
        alcho: request.body.alco,
        active: request.body.active,
      };
      await Users.update(updateValues, { where: { id: userId } });

      // Set success response properties
      responseSuccess.code = 200;
      responseSuccess.status = "success";
      responseSuccess.message = "Predict success!";
      responseSuccess.data = jsonData;
      return responseSuccess;
    } catch (error) {
      console.error(error);

      // Set error response properties
      responseError.code = 500;
      responseError.status = "failed";
      responseError.message = "Predict failed!";
      return responseError;
    }
  }
}

// REGISTER USER
async function registerUsers(request) {
  // Create response objects
  var responseError = new ResponseClass.ErrorResponse();
  var responseSuccess = new ResponseClass.SuccessResponse();

  // Parse the birthdate from the request body
  const parsedBirthdate = new Date(request.birthdate);

  // Check if any required fields are missing or invalid
  if (
    !request.email ||
    !request.password ||
    !request.username ||
    !parsedBirthdate ||
    !request.gender ||
    !request.height ||
    !request.weight
  ) {
    responseError.message = "Please fill all fields correctly!";
    return responseError;
  } else {
    // Variable initialization
    let age = 0;
    let fatneed = 0.0;
    let proteinneed = 0.0;
    let caloryneed = 0.0;
    let fiberneed = 0.0;
    let carbohidrateneed = 0.0; // Kebutuhan karbohidrat: 65% x kebutuhan kalori
    let bmr = 0.0;

    // Activity factor numbers
    let lightphysical = 1.375; // pekerja kantor yang menggunakan komputer
    let mediumphysical = 1.55; // olahragawan biasa
    let hardphysical = 1.725; // atlet atau orang yang melakukan pekerjaan fisik berat

    // Calculate age
    const birthdate = new Date(request.birthdate);
    const ageDiffMs = Date.now() - birthdate.getTime();
    const ageDate = new Date(ageDiffMs);
    age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Calculate BMR (Basal Metabolic Rate) using Harris-Benedict equation
    if (request.gender == "male") {
      // BMR = 88,362 + (13,397 x berat badan dalam kg) + (4,799 x tinggi badan dalam cm) – (5,677 x usia dalam tahun)
      bmr =
        88.362 +
        13.397 * request.weight +
        4.799 * request.height -
        5.677 * age;
    } else if (request.gender == "female") {
      // BMR = 447,593 + (9,247 x berat badan dalam kg) + (3,098 x tinggi badan dalam cm) – (4,330 x usia dalam tahun)
      bmr =
        447.593 +
        9.247 * request.weight +
        3.098 * request.height -
        4.33 * age;
    }

    // Total Energy Expenditure = Basal Metabolic Rate * Physical Activity Factor
    caloryneed = bmr * mediumphysical;

    // Total kalori harian x Persentase lemak (20%) / 9
    fatneed = (0.2 * caloryneed) / 9;

    // Kebutuhan protein adalah sebesar 15% dari kebutuhan kalori total. Setelah menemukan besarnya kalori untuk protein, ubahlah ke dalam gram. Protein sebanyak 1 gram setara dengan 4 kalori.
    proteinneed = (0.15 * caloryneed) / 4;

    fiberneed = 30; // dalam gram

    const emailRegexp =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Check if email is valid
    if (emailRegexp.test(request.email) == false) {
      responseError.code = 400;
      responseError.status = "failed";
      responseError.message = "Email is invalid!";
      return responseError;
    } else {
      // Check if email is already registered
      const emailuserRegistered = await Users.findOne({
        where: { email: request.email },
      });

      if (emailuserRegistered == null) {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt();
        const hashPass = await bcrypt.hash(request.password, salt);

        // Create data object for user registration
        const data = {
          id: uuidv4(),
          name: request.name,
          email: request.email,
          password: hashPass,
          username: request.username,
          birthdate: parsedBirthdate,
          gender: request.gender,
          height: request.height,
          weight: request.weight,
          fatneed: fatneed,
          proteinneed: proteinneed,
          caloryneed: caloryneed,
          fiberneed: fiberneed,
          carbohidrateneed: carbohidrateneed,
        };

        try {
          // Add user to the database
          await Users.create(data);

          // Set success response properties
          responseSuccess.code = 200;
          responseSuccess.message = "Register success!";
          responseSuccess.data = data;
          return responseSuccess;
        } catch (error) {
          console.log(error);

          // Set error response properties
          responseError.code = 400;
          responseError.status = "failed";
          responseError.message = "Register failed!";
          return responseError;
        }
      } else {
        responseError.code = 400;
        responseError.status = "failed";
        responseError.message = "Email has been registered";
        return responseError;
      }
    }
  }
}

// LOGIN
async function loginUsers(request) {
  // Create response object
  var responseError = new ResponseClass.ErrorResponse();

  // Check if email or password is missing
  if (!request.body.email || !request.body.password) {
    responseError.message = "Email or password missing!";
    return responseError;
  } else {
    // Find email from request body in the database
    const userRegistered = await Users.findOne({
      where: { email: request.body.email },
    });

    // Check if email is not found
    if (userRegistered == null) {
      responseError.message = "Email not found!";
      return responseError;
    } else {
      // Compare request body password with password in the database
      const matchPassword = await bcrypt.compare(
        request.body.password,
        userRegistered.password
      );

      // Check if the password is wrong
      if (!matchPassword) {
        responseError.message = "Wrong Password!";
        return responseError;
      } else {
        // Generate tokens for authentication
        const resultToken = generateToken(userRegistered);

        try {
          // Update refresh token in the database
          await Users.update(
            { refresh_token: resultToken.refreshToken },
            {
              where: {
                id: userRegistered.id,
              },
            }
          );

          // Create login result object
          const loginResult = {
            code: 200,
            userId: userRegistered.id,
            refresh_token: resultToken.refreshToken,
            accessToken: resultToken.accessToken,
          };

          return loginResult;
        } catch (error) {
          console.log(error);

          // Set error response properties
          responseError.message = error;

          return responseError;
        }
      }
    }
  }
}

// LOGOUT
async function logoutUsers(request) {
  // Create response objects
  var responseError = new ResponseClass.ErrorResponse();
  var responseSuccess = new ResponseClass.SuccessWithNoDataResponse();

  // Check if the request is empty
  if (!request) {
    responseSuccess.code = 204;
    responseSuccess.message = "The Request did not return any content";
    return responseSuccess;
  }

  try {
    // Split the request to extract the refresh token
    const requestCookie = request.split("=");
    const refreshToken = requestCookie[1];

    // Find the user associated with the refresh token
    const loginUser = await Users.findOne({
      where: { refresh_token: refreshToken },
    });

    if (loginUser !== null) {
      // Update the refresh token to null in the database
      await Users.update(
        { refresh_token: null },
        { where: { id: loginUser.id } }
      );
    } else {
      responseSuccess.code = 204;
      responseSuccess.message = "The Request did not return any content";
      return responseSuccess;
    }

    // Set success response properties
    responseSuccess.code = 200;
    responseSuccess.message = "You've Been Logged Out";
    return responseSuccess;
  } catch (error) {
    console.log(error);

    // Set error response properties
    responseError.code = 500;
    responseError.message = error;
    return responseError;
  }
}

function generateToken(userRegistered) {
  // Extract user information from the userRegistered object
  const userId = userRegistered.id;
  const name = userRegistered.name;
  const email = userRegistered.email;

  // Create access token for authorization using JWT
  const accessToken = jwt.sign(
    { userId, name, email }, // Payload containing user information
    process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
    {
      // expiresIn: "120s", // Expiration time of 120 seconds (2 minutes)
      expiresIn: "120d", // Alternatively, use "120d" for 120 days
    }
  );

  // Create refresh token using JWT
  const refreshToken = jwt.sign(
    { userId, name, email }, // Payload containing user information
    process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the token
    {
      expiresIn: "360d", // Expiration time of 360 days
    }
  );

  // Construct an object containing the refresh token and access token
  const token = {
    refreshToken: refreshToken,
    accessToken: accessToken,
  };

  return token; // Return the token object
}

export default {
  getAll,
  getById,
  predict,
  registerUsers,
  loginUsers,
  logoutUsers,
};
