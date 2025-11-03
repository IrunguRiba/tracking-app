const express=require("express");
const deviceRouter = require("express").Router();

const { registerMyDevice, getMyDeviceInfo, updateMyDevice, deleteMyDevice } = require("../Controllers/deviceController");
deviceRouter.post("/registerMyDevice", registerMyDevice);
deviceRouter.get("/getMyDeviceInfo/:_id", getMyDeviceInfo);
deviceRouter.put('/updateMyDevice/:_id', updateMyDevice);
deviceRouter.delete('/deleteMyDevice/:_id', deleteMyDevice);

module.exports=deviceRouter;