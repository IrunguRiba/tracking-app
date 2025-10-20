const express=require('express')

const locationRouter=express.Router();

const { getDeviceLocations}= require("../Controllers/locationController")

locationRouter.get('/deviceLocations/:deviceId', getDeviceLocations);

module.exports=locationRouter;
