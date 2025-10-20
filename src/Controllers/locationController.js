


const mongoose = require("mongoose");
const socketIo = require('socket.io');
const Device = require('../Models/device');
const Location = require('../Models/location');
const User = require("../Models/user");

function getLocationFromFrontEndandSave(httpServer) {

  const io = socketIo(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('coordinates', async ({ latitude, longitude, userId, deviceId }) => {
      console.log(`Received coords: ${latitude}, ${longitude}, User: ${userId}, Device: ${deviceId}`);

      try {
        const existingUser = await User.findOne({_id: userId});
        if (!existingUser) {
          console.log(`User not found: ${userId}`);
          return;
        }

        const existingDevice = await Device.findOne({_id: deviceId});
        if (!existingDevice) {
          console.log(`Device not found: ${deviceId}`);
          return;
        }

        const newDeviceLocation = await Location.create({
          latitude,
          longitude,
          userId,
          deviceId
        });

        if (!existingDevice.location) {
          existingDevice.location = [];
        }
        existingDevice.location.push(newDeviceLocation._id);
        await existingDevice.save();

        console.log(`Location stored successfully for device ${deviceId}`);
        socket.emit('location_saved', newDeviceLocation);

      } catch (error) {
        console.error("Error saving location: ", error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  
}

async function getDeviceLocations(req, res){

  const {   deviceId}=req.params

  try{



    if (!mongoose.Types.ObjectId.isValid( deviceId)) {
      return res.status(400).json({ message: "Invalid ID format" });      
    }

    
    const existingDevice= await Device.findOne({ _id: deviceId});
    if(!existingDevice){
return res.status(400).json({message: "Device not found"})
    }

   
    const foundLocations = await Location.find({  deviceId }).sort({ createdAt: -1 });

    const latestLocation = foundLocations[0];

    res.status(200).json({
      message: "User latest Locations retrieval success",
      latitude: latestLocation.latitude,
      longitude: latestLocation.longitude,
      lastSeen: latestLocation.timestamp
    })

  }catch(error){
    console.log(" Error Locating device", error);

   
    res.status(500).json({
      message: "An internal server error occurred.",
      error: error.message,
    });

  }
  
  
}


module.exports = { getLocationFromFrontEndandSave, getDeviceLocations };
