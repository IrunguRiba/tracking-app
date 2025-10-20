const Device = require("../Models/device");
const User = require("../Models/user");
const Locations = require("../Models/location");
const mongoose = require("mongoose");


// Create and Save a new Device

module.exports = {
  createDevice: async (req, res) => {
    const { name, type, model, description, userId } = req.body;
    try {
      const newDevice = new Device({
        name,
        type,
        model,
        description,
        user: userId,
      });
      const existingUser = await User.findOne({ _id: userId });
      if (!existingUser) {
        return res.status(401).json({
          message: "Cannot register Device to this user, User does not exist"
        });
      }

      const savedDevice = await newDevice.save();

      existingUser.devices.push(savedDevice._id);
      await existingUser.save();
      await existingUser.populate("devices");


      res.status(201).json({
        message: "Device created success",
        savedDevice,
        user: existingUser.userName,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: "Error creating device", error });
      
    }
  },



  getDevices: async (req, res) => {

    try {
      
      const isUserAdmin= await User.findOne({ isAdmin : true})
      if (!isUserAdmin) {
        return res.status(403).json({ message: "Unauthorized! Admin only." });
      }

      const devices = await Device.find().populate("user", "userName email").populate("location", "longitude latitude timestamp");

      res.status(200).json({
        message:"All devices found for all users and locations",
        DevicesOwned: devices
      
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching devices", error });
    }
  },




  getDeviceById: async (req, res) => {
    const { _id} = req.params;
    try {

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid ID format" });      
      }

      
      const isUserAdmin= await User.findOne({ isAdmin : true})
      if (!isUserAdmin) {
        return res.status(403).json({ message: "Unauthorized! Admin only." });
      }
      const requestedDevice = await Device.findById({ _id }).populate("user", "userName email").populate("location", "longitude latitude timestamp");

      if (!requestedDevice) {
        console.log("Device not found");
        return res.status(404).json({ message: `Device ${ _id} not found` });
       
      }
      res.status(200).json({
        message: "Device found successifully",
        Device: requestedDevice,
      });
    } catch (error) {
      console.error("Error fetching device", error);

      res.status(500).json({
        message: "An internal server error occurred.",
        error: error.message,
      });
    }
  },


  updateDeviceInfo: async (req, res) => {
    const {_id } = req.params;
    const updateData = req.body;

    try {

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid ID format" });      
      }

      const updatedDevice = await Device.findOneAndUpdate(
        { _id },
        { $set: updateData },
        { new: true }
      ).populate("user", "userName email").populate("location", "longitude latitude timestamp");

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




  deleteDevice: async (req, res) => {
    const {  _id  } = req.params;

    try {
      const existingDevice = await Device.findOneAndDelete({  _id  }).populate("location", "longitude latitude timestamp");

   if (!existingDevice) {
        console.log("Device does not exist");
      }

      await User.updateMany(
        { devices:  _id  },
        { $pull: { devices:  _id  } }
      );
      

      res.status(200).json({
        message: "Device deleted sucessifully",
        DeletedDevice: existingDevice,
      });

    } catch (error) {
      console.error("Error deleting device", error);

      if (!mongoose.Types.ObjectId.isValid( _id )) {
        return res.status(400).json({ message: "Invalid ID format" });      
      }

      res.status(500).json({
        message: "An internal server error occurred.",
        error: error.message,
      });
    }
  }
};
