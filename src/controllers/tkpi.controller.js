// SERVICE
import tkpiService from "../services/tkpi.service.js";

const get = async (req, res, next) => {
  try {
    res.json(await tkpiService.getFoodList());
  } catch (err) {
    console.error(`Error while getting food list`, err.message);
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await tkpiService.createIntakeUsersTKPI(req);
    if (data.status === "success") {
      return res.status(201).json(data);
    }
    return res.status(400).json(data);
  } catch (error) {
    console.error(`Error while creating intake users`, err.message);
    next(err);
  }
}

export default {
  get,
  create
};
