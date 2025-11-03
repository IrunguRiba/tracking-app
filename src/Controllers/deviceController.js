const Device = require("../Models/device");
const User = require("../Models/user");
const Locations = require("../Models/location");
const mongoose = require("mongoose");

// Create and Save a new Device

module.exports = {
  registerMyDevice: async (req, res) => {
    const { userId, name, type, model, description} = req.body;
    try {
    
        
        const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(401).json({
          message: "Cannot register Device to this user, User does not exist",
        });
      }
      console.log("User deviceInfo value:", existingUser.deviceInfo);

      if (existingUser.deviceInfo) {
        return res.status(400).json({
          message: "You already have a registered device",
          existingDevice: existingUser.deviceInfo
        });
      }
      

      const newDevice = new Device({
        name,
        type,
        model,
        description
      });
     

      const savedDevice = await newDevice.save();

      existingUser.deviceInfo = savedDevice._id;
      await existingUser.save();
      await existingUser.populate("deviceInfo");

      res.status(201).json({
        message: "Device Registered success",
        myDevice: savedDevice,
        User: existingUser.userName,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: "Error creating device", error });
    }
  },

  getMyDeviceInfo: async (req, res) => {
    const { _id } = req.params;
    try {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      
      const requestedDevice = await Device.findById({ _id })
        .populate("location", "longitude latitude timestamp")

      if (!requestedDevice) {
        console.log("Device not found");
        return res.status(404).json({ message: `Device ${_id} not found` });
      }

      if(requestedDevice.location && requestedDevice.location.length>0){
        requestedDevice.location.sort((lastestTime, lastTime)=>{
          return lastTime.timestamp-lastestTime.timestamp

        })
      }
      res.status(200).json({
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
    const { _id } = req.params;
    const updateData = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const updatedDevice = await Device.findOneAndUpdate(
        { _id },
        { $set: updateData },
        { new: true }
      )
        .populate("location", "longitude latitude timestamp");

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
      const existingDevice = await Device.findOneAndDelete({ _id }).populate(
        "location",
        "longitude latitude timestamp"
      );

      if (!existingDevice) {
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
