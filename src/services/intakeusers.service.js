// library
import { IntakeUsers } from "../models/intakeusers.model.js";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
// data
import dataMakanan from "../Data/dataMakanan.json" assert { type: "json" };
// model
import { Users } from "../models/users.model.js";
// response
import ResponseClass from "../models/response.model.js";

// GET ALL INTAKE
async function getMultiple() {
  try {
    const dbResult = await IntakeUsers.findAll({});
    const responseSuccess = new ResponseClass.SuccessResponse(
      200,
      "success",
      "Fetching intake users successfully!",
      dbResult
    );
    return responseSuccess;
  } catch (error) {
    console.error(error);
    const responseError = new ResponseClass.ErrorResponse(
      400,
      "failed",
      "Error fetching intake users!"
    );
    return responseError;
  }
}

// GET USER INTAKE HISTORY
async function getHistory(request) {
  var responseError = new ResponseClass.ErrorResponse();
  var responseSuccess = new ResponseClass.SuccessResponse();

  const { intakeUserId } = request.params;

  try {
    const dbResult = await IntakeUsers.findAll({
      where: {
        userid: intakeUserId,
      },
      order: [["createdAt", "DESC"]],
    });
    responseSuccess.code = 200;
    responseSuccess.status = "success";
    responseSuccess.message = "Fetching intake users successfully!";
    responseSuccess.data = dbResult;
    return responseSuccess;
  } catch (error) {
    responseError.code = 400;
    responseError.status = "failed";
    responseError.message = "Error fetching intake user!";
    return responseError;
  }
}

//  GET INTAKE BY ID
async function getById(request) {
  var responseError = new ResponseClass.ErrorResponse();
  var responseSuccess = new ResponseClass.SuccessResponse();

  const { intakeUserId } = request.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // today.setHours(today.getHours() + 7);
  const check = await IntakeUsers.findOne({
    where: {
      userid: intakeUserId,
      createdAt: {
        [Op.gte]: today,
      },
    },
    attributes: ["healthstatus", "feedback"],
  });
  console.log("today ="+ today, "data =" + check)
  try {
    if (check == null) {
      return {
        status: "success",
        code: 200,
        message: "Fetching intake users id successfully!",
        data: {
          healthstatus: "UNKNOWN",
          feedback: "You haven't fill intake form for today.",
        },
      };
    } else {
      responseSuccess.code = 200;
      responseSuccess.status = "success";
      responseSuccess.message = "Fetching intake users id successfully!";
      responseSuccess.data = check;
      return responseSuccess;
    }
  } catch (error) {
    console.error(error);
    responseError.code = 400;
    responseError.status = "failed";
    responseError.message = "Error fetching intake user BY ID";
    return responseError;
  }
}

// INTAKE
async function createIntakeUsers(request) {
  var responseError = new ResponseClass.ErrorResponse();
  var responseSuccess = new ResponseClass.SuccessResponse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setHours(today.getHours() + 7);
  const { userId } = request.params;
  const check = await IntakeUsers.findOne({
    where: {
      userid: userId,
      createdAt: {
        [Op.gte]: today,
      },
    },
  });
  if (check !== null) {
    return {
      status: "success",
      code: 200,
      message: "You have filled this form today!",
    };
  } else {
    let totalFat = 0;
    let totalProtein = 0;
    let totalCalory = 0;
    let totalFiber = 0;
    let totalCarbohidrate = 0;
    let inputData = request.body;

    for (let food in inputData) {
      let foodData = inputData[food];
      let jsonFileData = dataMakanan[food];

      totalFat += foodData * jsonFileData.fat;
      totalProtein += foodData * jsonFileData.protein;
      totalCalory += foodData * jsonFileData.calory;
      totalFiber += foodData * jsonFileData.fiber;
      totalCarbohidrate += foodData * jsonFileData.carbohidrate;
    }

    const userdata = await Users.findOne({ where: { id: userId } });

    const lackof = [];

    if (totalFat < userdata.fatneed) lackof.push("fat");
    if (totalProtein < userdata.proteinneed) lackof.push("protein");
    if (totalCalory < userdata.caloryneed) lackof.push("calory");
    if (totalFiber < userdata.fiberneed) lackof.push("fiber");
    if (totalCarbohidrate < (65 / 100) * request.body.caloryintake)
      lackof.push("carbohidrate");

    let feedback, status;

    if (lackof.length === 0) {
      feedback =
        "Great job on meeting your daily nutrition needs! Keep up the good work and continue to prioritize a balanced and healthy diet. Remember to listen to your body and make adjustments as necessary to maintain optimal health.";
      status = "EXCELLENT";
    } else {
      feedback = `You are not meeting your daily nutrition needs for ${lackof.join(
        ", "
      )}. Consider adjusting your diet to include more of these nutrients.`;
      status = "POOR";

      // Generate feedback for each specific condition
      const conditions = {
        protein:
          "Increase your intake of protein-rich foods such as lean meats, poultry, fish, eggs, dairy, legumes, and nuts.",
        fat: "Include healthy sources of fats in your diet, such as avocados, nuts, seeds, and olive oil.",
        calory:
          "Ensure that you are consuming enough calories to meet your energy needs. Consider adding more nutrient-dense foods to your meals and snacks.",
        fiber:
          "Boost your fiber intake by incorporating more fruits, vegetables, whole grains, and legumes into your diet.",
        carbohidrate:
          "Include complex carbohydrates like whole grains, fruits, and vegetables to meet your carbohydrate needs.",
      };

      const specificFeedback = lackof.map((nutrient) => conditions[nutrient]);
      feedback +=
        "\n\nSpecific recommendations:\n" + specificFeedback.join("\n");
    }

    const createdAtValue = new Date();
    const updatedAtValue = new Date();
    createdAtValue.setHours(createdAtValue.getHours() + 7);
    updatedAtValue.setHours(updatedAtValue.getHours() + 7);

    try {
      const intakeUserId = uuidv4();
      const data = {
        id: intakeUserId,
        userid: userId,
        fatintake: totalFat,
        proteinintake: totalProtein,
        caloryintake: totalCalory,
        fiberintake: totalFiber,
        carbohidrateintake: totalCarbohidrate,
        healthstatus: status,
        feedback: feedback,
        createdAt: createdAtValue,
        updatedAt: updatedAtValue,
      };
      await IntakeUsers.create(data);
      responseSuccess.code = 200;
      responseSuccess.status = "success";
      responseSuccess.message = "Creating intake users successfully!";
      responseSuccess.data = data;
      return responseSuccess;
    } catch (error) {
      console.error(error);
      responseError.code = 400;
      responseError.status = "failed";
      responseError.message = "Error creating intake users!";
      return responseError;
    }
  }
}

export default {
  getMultiple,
  getById,
  getHistory,
  createIntakeUsers
};
