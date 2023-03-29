const express = require("express");
const controller = require("../controllers/auth");
const router = express.Router();
const axios = require("axios");

router.get("/", (req, res) => {
  res.render("Home",{header:controller.header(req,res)});
});


router.get("/About", (req, res) => {
  return res.render("About");
});


//////////////////////////////////////////////////////////Authentication///////////////////////////////////////////////////////////
//Signup
router.get("/Signup", (req, res) => {
  res.render("Signup",{header:controller.header(req,res)});
});
router.post("/Signup", controller.register);

//Login
router.get("/Login", (req, res) => {
  res.render("Login",{header:controller.header(req,res)});
});

router.post("/Login", controller.login);

//ForgotPassword
router.get("/ForgotPassword",(req,res)=>{
  res.render("ForgotPassword");
});
router.post("/ForgotPassword",controller.forgotpassword);

router.get("/Logout", controller.Signout);

//////////////////////////////////////////////////////////User Level Functtions///////////////////////////////////////////////////////////

router.get("/UserDashboard", controller.requireauth,controller.Dashboard);
router.post("/UserDashboard", controller.requireauth,controller.PostDashboard);


router.get("/Pricing", controller.requireauth,controller.getpricing);
router.post("/PayforPlan", controller.requireauth, controller.postpricing);

router.get("/Bot", controller.requireauth, (req, res) => {
  res.render("ChatBot",{header:controller.header(req,res)});
});

router.get("/Dalle", controller.requireauth, (req, res) => {
  res.render("Dalle",{header:controller.header(req,res)});
});

//Only For Testing Purposes
router.get("/protected", controller.getProtected);

//////////////////////////////////////////////////////////API ENDPOINTS///////////////////////////////////////////////////////////

//API ENDPOINTS For Email Verification
router.post("/api/generate-email",controller.VerificationAPI);

//OPENAI Response
router.post("/api/generate-response",controller.requireauth,controller.Chat);

router.post("/api/generate-image",controller.requireauth, controller.Image);

//////////////////////////////////////////////////////////Payment WebHooks///////////////////////////////////////////////////////////

router.get("/stripe", (req, res) => {
  return res.json({Pay:"Accepted"});
});

router.post('/stripe', controller.Stripe);


module.exports = router;