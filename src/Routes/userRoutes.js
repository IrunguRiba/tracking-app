const express = require("express");
const router = express.Router();

const { createUser, logInUser , adminRegister, adminLogIn, getUsers,getUserById,  getUserByPin} = require("../Controllers/userController");
 
router.post("/newUsers", createUser);
router.post("/userLogIn", logInUser);
router.post("/newAdmin", adminRegister)
router.post ("/adminLogIn", adminLogIn)
router.get("/getUsers", getUsers);
router.get('/getUser/:_id', getUserById)
router.get('/getUserByPin/:pin',  getUserByPin);

module.exports = router;