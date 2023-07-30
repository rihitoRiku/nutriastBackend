// SERVICE
import intakeUsersService from "../services/intakeusers.service.js";

const get = async (req, res, next) => {
  try {
    res.json(await intakeUsersService.getMultiple());
  } catch (err) {
      console.error(`Error while getting intake user`, err.message);
      next(err);
  }
}

const getbyid = async (req, res, next) => {
  try {
    res.json(await intakeUsersService.getById(req));
  } catch (err) {
      console.error(`Error while getting intake user by id`, err.message);
      next(err);
  }
}

const gethistory = async (req, res, next) => {
  try {
    res.json(await intakeUsersService.getHistory(req));
  } catch (err) {
      console.error(`Error while getting intake user history by id`, err.message);
      next(err);
  }
}

const create = async (req, res, next) => {
  try {
    const data = await intakeUsersService.createIntakeUsers(req);
    if (data.status === "success") {
      return res.status(201).json(data);
    }
    return res.status(400).json(data);
  } catch (err) {
    console.error(`Error while creating intake users`, err.message);
    next(err);
  }
};

export default {
  get,
  getbyid,
  gethistory,
  create
}