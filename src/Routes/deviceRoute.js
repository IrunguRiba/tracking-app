const express=require("express");
const deviceRouter = require("express").Router();

const { createDevice, getDevices, updateDeviceInfo, deleteDevice, getDeviceById } = require("../Controllers/deviceController");
deviceRouter.post("/newDevice", createDevice);
deviceRouter.get("/getDevices", getDevices);
deviceRouter.get("/getDevice/:_id", getDeviceById)
deviceRouter.put('/update/:_id', updateDeviceInfo)
deviceRouter.delete('/delete/:_id', deleteDevice)

module.exports=deviceRouter;