const express = require("express");
const {
  userSchema,
  logInSchema,
} = require("../Middlewares/Validators/userValidator");
const User = require("../Models/user");
const bcrypt = require("bcrypt");

userLoggedIn = false;

module.exports = {
  //Sign up logic
  createUser: async (req, res) => {
    const { password } = req.body;
    try {
      const { error, value } = userSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const existingUser = await User.findOne({ email: value.email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({ ...value, password: hashedPassword });
      await newUser.save();

      res.status(201).json({
        message: "User created successfully",
        user: newUser,
        userLoggedIn: false,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //Admin registration
  adminRegister: async (req, res) => {
    const { password } = req.body;
    try {
      const { error, value } = userSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const existingUser = await User.findOne({ email: value.email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newAdmin = new User({
        ...value,
        password: hashedPassword,
        role: "admin",
        isAdmin: true,
      });
      await newAdmin.save();

      res.status(201).json({
        message: "Adminstrator Account created successfully",
        user: newAdmin,
        userLoggedIn: false,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //Admin log in
  adminLogIn: async (req, res) => {
    const { password } = req.body;
    try {
      const { error, value } = logInSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const user = await User.findOne({ email: value.email });
      if (!user) {
        return res
          .status(401)
          .json({ error: "Email does not exist, kindly register new account" });
      }
      if (!user.isAdmin) {
        return res
          .status(401)
          .json({ message: `Access Denied, user not Admin` });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      res.status(200).json({
        message: `Logged in successifully, Welcome back Admin${user.userName}`,
        user: user,
        userLoggedIn: true,
      });
    } catch (error) {
      console.log(error.details);
    }
  },

  //Log in logic
  logInUser: async (req, res) => {
    const { password } = req.body;
    try {
      const { error, value } = logInSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const user = await User.findOne({ email: value.email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Email does not exist, kindly register new account" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      res.status(200).json({
        message: `Logged in successifully, Welcome back ${user.userName}`,
        user: user,
        userLoggedIn: true,
      });
    } catch (error) {
      console.log(error.details);
    }
  },
  getUsers: async(req, res) => {
    try {
      const users = await User.find().populate({
        path: "devices", 
        select: "name model type description status",
        populate: {
          path: "location",
          select: "longitude latitude timestamp -_id"
        }
      });
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error: error.message });
    }
  },


  deleteUsers: async (req, res)=>{

    
  }
};
