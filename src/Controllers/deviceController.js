const Device = require("../Models/device");
const User = require("../Models/user");
const Locations = require("../Models/location");
const mongoose = require("mongoose");      
const crypto = require('crypto');


module.exports = {
  registerMyDevice: async (req, res) => {
    const { _id } = req.params;
    const { name, type, model, description } = req.body;
  
    try {
      const existingUser = await User.findById(_id).populate("deviceInfo");
  
      if (!existingUser) {
        return res.status(401).json({
          message: "Cannot register device to this user, user does not exist",
        });
      }
  
      console.log("User deviceInfo value:", existingUser.deviceInfo);

  const deviceArray = existingUser.deviceInfo || [];
const deviceExists = deviceArray.some(device =>
  device.name === name &&
  device.type === type &&
  device.model === model &&
  device.description === description
);

  
      if (deviceExists) {
        return res.status(400).json({
          message: "Device already registered for this user",
        });
      }
      const newDevice = new Device({ name, type, model, description, userId: existingUser._id });
      const savedDevice = await newDevice.save();

      existingUser.deviceInfo = existingUser.deviceInfo || [];
      existingUser.deviceInfo.push(savedDevice._id);
      await existingUser.save();
      res.status(201).json({
        message: "Device registered successfully",
        myDevice: savedDevice,
        User: existingUser.userName,
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error creating device",
        error,
        Error: error.message
      });
    }
  },
  
  getMyDeviceInfo: async (req, res) => {
    const { _id } = req.params;
    try {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      
      const requestedDevice = await Device.findById({ _id })
        .populate("location", "longitude latitude timestamp").populate("deviceInfo");

      if (!requestedDevice) {
        console.log("Device not found");
        return res.status(404).json({ message: `Device ${_id} not found` });
      }
      if(requestedDevice.location && requestedDevice.location.length>0){
        requestedDevice.location.sort((lastestTime, lastTime)=>{
          return lastTime.timestamp-lastestTime.timestamp
        })
      }
      res.status(201).json({
        message: "Device found successifully",
        Device: requestedDevice,
        LatestLocation: requestedDevice.location[0] || null
      });
    } catch (error) {
      console.error("Error fetching device", error);

      res.status(500).json({
        message: "An internal server error occurred.",
        error: error.message,
      });
    }
  },

  updateMyDevice: async (req, res) => {
    const {_id} = req.params;
    const updateData = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const updatedDevice = await Device.findOneAndUpdate( { _id }, { $set: updateData }, { new: true }).populate("location", "longitude latitude timestamp");

      if (!updatedDevice) {
        return res.status(404).json({
          message: "Device not found.",
        });
      }

      res.status(200).json({
        message: "Device updated successifully",
        UpdatedDevice: updatedDevice,
      });
    } catch (error) {
      console.log(" Error Updating device", error);
      res.status(500).json({
        message: "An internal server error occurred.",
        error: error.message,
      });
    }
  },

  deleteMyDevice: async (req, res) => {
    const { _id } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const existingDevice = await Device.findOneAndDelete({ _id }).populate(
        "location",
        "longitude latitude timestamp"
      );


      if (!existingDevice) {
        res.status(400).json({
          message: "Failed! No user found to delete"
        })
        console.log("Device does not exist");
      }

      res.status(200).json({
        message: "Device deleted sucessifully",
        DeletedDevice: existingDevice,
      });
    } catch (error) {
      console.error("Error deleting device", error);

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      res.status(500).json({
        message: "An internal server error occurred.",
        error: error.message,
      });
    }
  },
};





