const express = require("express");
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const hbs = require("hbs");
const fs = require("fs");
const Stripe = require('stripe');

const SecretKey = process.env.SecretKey;

dotenv.config({ path: "./.env" });

const app = express();

//MiddleWare
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: "06vUSNEzq1z9U476UrMEx7xIOPGYfu2m",
    resave: false,
    saveUninitialized: false,
  })
);

//View-Engine
app.set("view engine", "hbs");

const partialsDir = __dirname + "/views/partials";
const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  const matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  const name = matches[1];
  const template = fs.readFileSync(partialsDir + "/" + filename, "utf8");
  const partial = hbs.compile(template);
  hbs.registerPartial(name, partial);
});


//Path Controller
app.use(express.static(__dirname + "/public"));
app.use("/", require("./routes/pages"));

app.listen(5000);