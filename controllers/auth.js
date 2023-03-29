const mysql = require("mysql");
const SecretKey = process.env.SecretKey;
const jwt = require("jsonwebtoken");
const encrypter = require("bcryptjs");
const Stripe = require("stripe");
const express = require("express");
const axios = require("axios");
const rawBody = require("raw-body");

const stripe = Stripe(
  "sk_test_51MpqeQHcPzLUD2189CyFG4NSFHaH5leuslPkh2HchDHcRnqlpV5mzZWyTkZW4Jt8BQrHsrB78bH1zH4apmj4mzSX00YdoZupLX"
);
const endpointSecret = "whsec_eecd7c54e3ac971b5302c1e045ceaaa054d3eef1a793003fa6a3efb00173fc9e";

const OPENAI_API_KEY = "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";

axios.defaults.withCredentials = true;

const db = mysql.createConnection({
  host: process.env.DATABASE_Host,
  user: process.env.DATABASE_User,
  password: process.env.DATABASE_Password,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.error(error);
  }
});

exports.register = (req, res) => {
  console.log(req.body);
  //res.redirect('/Signup');
  const { name, email, password, dob, otp } = req.body;
  db.query(
    "Select OTP from otp_table where email = ? and TIMESTAMPDIFF(MINUTE, created_at, NOW()) <= 30",
    [email],
    (err, result) => {
      if (err) {
        //console.log("Error Occured at OTP_Table");
      }
      if (result) {
        //console.log(result);
        if (result.length >= 1) {
          if (otp == result[0].OTP) {
            db.query(
              "Select email from Users where email = ?",
              [email],
              async (error, result) => {
                if (error) {
                  //console.log(error);
                }
                if (result.length > 0) {
                  return res.render("Signup", {
                    message: "Email Already Register",
                  });
                } else {
                  let hashed = await encrypter.hash(password, 8);
                  db.query(
                    "Insert into Users SET ? ",
                    { Name: name, Email: email, Password: hashed, DOB: dob },
                    (error, result) => {
                      if (error) {
                        //console.log(error);
                      } else {
                        // console.log(result);
                        // console.log(result.insertId);
                        db.query("Insert into useable set ? ", {
                          UID: result.insertId,
                          Prompts: 5,
                          Images: 0,
                        });
                        return res.send("User Registered");
                      }
                    }
                  );
                }
              }
            );
          } else {
            return res.render("Signup", {
              message: "Incorrect OTP.",
            });
          }
        } else {
          return res.render("Signup", {
            message: "Incorrect OTP.",
          });
        }
      }
    }
  );

  //res.send("Form Submitted");//,{message:'Post Request Taken Care Of'});
};

exports.login = async (req, res) => {
  //console.log(req.body);
  //res.redirect('/Signup');
  const { email, password } = req.body;
  //console.log(req.body);

  db.query(
    "Select * from Users where email = ?",
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      }
      if (result.length == 1) {
        user = result[0];
        const isMatch = await encrypter.compare(password, user.Password);

        if (!isMatch) {
          return res.render("Login", { message: "Invalid email or password" });
          //return res.status(401).json({ message: "Invalid email or password" });
        }

        const authorization = jwt.sign({ user }, SecretKey, {
          expiresIn: "6h",
        });
        res.cookie("authorization", authorization);

        if (req.session.returnTo) {
          const returnTo = req.session.returnTo;
          delete req.session.returnTo;
          return res.redirect(returnTo);
        }
        db.query(
          "UPDATE useable SET Prompts = 5, Images = 0, ResUpdated = NOW() WHERE UID = ? and DATEDIFF(NOW(), ResUpdated) > 30;",
          [user.ID],
          (err, result) => {
            if (err) {
              console.log("Error in Updating the resources.");
            }
            if (result) {
              console.log(result.affectedRows);
              if (result.affectedRows > 0) {
                db.query("insert into billing SET ? ", {
                  U_ID: user.ID,
                  P_ID: 0,
                });
              }
            }
          }
        );
        res.redirect("/");
        // res.status(200).json({
        //   message: "Login Successful",
        //   authorization: authorization,
        // });
      } else {
        return res.redirect("Login", { message: "Invalid email or password" });
        //return res.status(401).json({ message: "Invalid email or password" });
      }
    }
  );
};

exports.forgotpassword = (req, res) => {
  console.log(req.body);
  const { email, password, otp } = req.body;
  db.query(
    "Select OTP from otp_table where email = ? and TIMESTAMPDIFF(MINUTE, created_at, NOW()) <= 30",
    [email],
    async (err, result) => {
      if (err) {
        console.log("Error Occured at OTP_Table");
      }
      if (result) {
        //console.log(result);
        if (result.length >= 1) {
          if (otp == result[0].OTP) {
            let hashed = await encrypter.hash(password, 8);
            db.query(
              "UPDATE users SET password = ? WHERE email = ?",
              [hashed, email],
              (err, result) => {
                if (result.affectedRows > 0) {
                  //console.log(result);
                  db.query("Delete from otp_table where email = ? ", [email]);
                  return res.render("ForgotPassword", {
                    message: "Password Changed Successfully.",
                  });
                }
              }
            );
          } else {
            return res.render("ForgotPassword", {
              message: "Incorrect OTP.",
            });
          }
        } else {
          return res.render("ForgotPassword", {
            message: "OTP Not Generated.",
          });
        }
      }
    }
  );
};

function Verifier(req) {
  const token = req.cookies ? req.cookies.authorization : null;

  if (!token) {
    //console.log("No Token");
    return; // res.status(401).json({ message: "Authentication failed" });
  } else {
    try {
      jwt.verify(token, SecretKey, (err, payload) => {
        if (err) {
          //console.log("User Token Verification Failed.");
        }
        if (payload) {
          //console.log("User Token Verified");
          user = payload.user;
        }
      });
      return user;
    } catch (error) {
      //console.error(error);
      return;
    }
  }
}

exports.requireauth = (req, res, next) => {
  let user = Verifier(req);
  //console.log("User Being Checked." + user);
  if (user) {
    //console.log("Authorized : " + user);
    next();
  } else {
    //console.log("Not Authorized : ");

    req.session.returnTo = req.originalUrl;
    res.redirect("/Login");
  }
};

exports.Signout = (req, res, next) => {
  res.cookie("authorization", "", { maxAge: 1 });
  res.redirect("/Login");
};

exports.getProtected = async (req, res) => {
  const user = await Verifier(req);
  if (user) {
    await db.query(
      "Select * from Users WHERE id = ?",
      user.ID,
      async (error, result) => {
        if (error) {
          console.log(error);
        }
        if (result.length == 1) {
          console.log("Verification Done");

          UserfromDb = result[0];
          //console.log(UserfromDb);
          return res.json(UserfromDb);
        }
      }
    );
  } else {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

exports.Chat = async (req, res) => {
  let User = Verifier(req);
  console.log(User);
  if (!user) {
    res.status(404).json({ error: "Kindly Relogin to Continue." });
  }
  db.query(
    "Select * from useable where UID = ? ",
    User.ID,
    async (error, result) => {
      if (error) {
        res.status(500).json({ error: "Prompts Maximum Limit Reached." });
      }
      if (result && result[0].Prompts > 1) {
        try {
          const query = req.body.query;
          let prompt =
            "As an advanced emotional and psychological chatbot, your primary goal is to provide psychological and emotional support to the best of your ability on user input. In order to effectively assist users, it is important to be Soft in your responses, try to Solve the Problems and Dont Tell Any kind of Personal information About You. <Conversation_History> : ";

          if (req.session.OpenAiData) {
            let data = JSON.stringify(req.session.OpenAiData);
            prompt = prompt + data + " . ";
          }

          prompt = prompt + " <Userinput>  " + query;

          console.log(prompt);
          const data = {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
          };

          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
          };

          const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            data,
            config
          );

          var answer = response.data.choices[0].message.content;
          //console.log(answer);
          const confidence = response.data.choices[0].confidence;
          // answer[0] = " ";
          // answer[1] = " ";

          // console.log("------------------------\n");
          // console.log(response.data.choices[0]);
          // console.log("------------------------\n");

          // console.log(answer);
          // console.log(confidence);

          if (response.data.choices.length === 0) {
            res.status(400).json({ error: "No response from OpenAI API." });
          } else if (answer === "") {
            res.status(400).json({ error: "Empty response from OpenAI API." });
          } else {
            //console.log("Session Data : ");
            //console.log(req.session.OpenAiData);
            if (req.session.OpenAiData == null) {
              //.log("Session = NULL");
              req.session.OpenAiData = [{ user: query, bot: answer }];
              //console.log(req.session.OpenAiData);
            } else {
              //console.log("Session = Remains Intact");
              let data = req.session.OpenAiData;
              data.push({ user: query, bot: answer });
              req.session.OpenAiData = data;
              //console.log(req.session.OpenAiData);
            }
            db.query(
              "Update useable set Prompts=Prompts-1 where UID = ? ",
              User.ID,
              async (error, result) => {
                if (error) {
                  console.log("Error in Reducing the Prompt Count");
                }
              }
            );
            res.status(200).json({ answer, confidence });
          }
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({ error: "Error making request to OpenAI API." });
        }
      } else {
        res.status(500).json({
          error: "Prompts Maximum Limit Reached.Kindly Upgrade to Continue.",
        });
      }
    }
  );
};

exports.Image = async (req, res) => {
  let User = Verifier(req);
  console.log(User);
  if (!user) {
    res.status(404).json({ error: "Kindly Relogin to Continue." });
  }
  db.query(
    "Select * from useable where UID = ? ",
    User.ID,
    async (error, result) => {
      if (error) {
        res.status(500).json({ error: "Images Maximum Limit Reached." });
      }
      if (result && result[0].Images > 1) {
        try {
          const query = req.body.query;
          const data = {
            prompt:
              "As an Advanced Image Generator, You Need to Generate the Cute and Natural Pictures of the User Input. If User Input is not Matching to any Living Thing or Natural Thing then Just Generate the image of any Natural View with No Text. <User Input> : " +
              query,
            n: 1,
            size: "512x512",
          };

          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
          };

          const response = await axios.post(
            "https://api.openai.com/v1/images/generations",
            data,
            config
          );
          var answer = response.data.data[0].url;

          console.log("------------------------\n");
          console.log(answer);
          console.log("------------------------\n");
          const statuscode = response.status;

          res.status(200).json({ answer, statuscode });
          if (statuscode == 200) {
            console.log("Oky Server");
          } else {
            res
              .status(statuscode)
              .json({ error: "No/Error Response from the Server." });
          }

          console.log("After Req");
          // if (url_res.length<10)//response.data.choices.length === 0)
          // {
          //   res.status(400).json({ error: "No response from OpenAI API." });
          // } else if (answer === "") {
          //   res.status(400).json({ error: "Empty response from OpenAI API." });
          // } else {
          //   res.status(200).json({ answer,statuscode });
          // }
        } catch (error) {
          console.log("Error");
          try {
            console.log(error.response.status);
            console.log(error.response.statusText);
          } catch (error) {}
          // status: 401,
          // statusText: 'UNAUTHORIZED',
          // try {
          //   var Err = error.response.statusText;
          //   res
          //     .status(error.response.status)
          //     .json({
          //       error: "Error making request to OpenAI API. Error With : " + { $var },
          //     });
          // } catch (error) {
          //   var status = error.response.status;
          //   res
          //     .status(500)
          //     .json({ error: "Error making request to OpenAI API." + { $status } });
          // }
        }
      } else {
        res.status(404).json({
          error: "Images Maximum Limit Reached.Kindly Upgrade to Continue.",
        });
      }
    }
  );
};

exports.VerificationAPI = async (req, res) => {
  //console.log("In Verification API.");
  let hashed = 111222;
  const { name, email, password, dob } = req.body;
  if (req.session.authotp == null) {
    req.session.authotp = hashed;
  }
  db.query("Delete from otp_table where email = ? ", [email]);
  //No Duplicate or Tricking the System
  db.query(
    "Insert into otp_table SET ? ",
    { email: email, OTP: hashed },
    (err, result) => {
      if (err) {
        res
          .status(404)
          .json({ error: "Some Error Occured While Generating OTP." });
      }
      if (result) {
        db.query(
          "DELETE FROM otp_table WHERE TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= 30;"
        );
        res.status(200).json({ data: "Kindly Check Your email to Login." });
      }
    }
  );
  console.log(name, email, password, dob);
};
//module.exports = {Verifier};

exports.Dashboard = (req, res) => {
  let user = Verifier(req);
  const isoDateString = user.DOB;
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDateString = `${year}-${month}-${day}`;
  user.DOB = formattedDateString;

  db.query("select * from useable where UID = ?", user.ID, (err, result) => {
    if (err) {
      res.render("UserDashboard", {
        message: user,
        Prompt: "Unable to Load Information",
        Images: "Unable to Load Information",
      });
    }
    if (result.length > 0) {
      console.log(result[0]);
      res.render("UserDashboard", {
        message: user,
        Prompt: result[0].Prompts,
        Images: result[0].Images,
      });
    }
  });
};

exports.PostDashboard = async (req, res) => {
  const { name, oldPassword, newpassword } = req.body;
  console.log(req.body);
  let user = Verifier(req);
  if (oldPassword) {
    const isMatch = await encrypter.compare(oldPassword, user.Password);
    if (!isMatch) {
      return res.status(200).json({ message: "Invalid email or password" });
    } else {
      if (newpassword && newpassword.length > 5) {
        let hashed = await encrypter.hash(newpassword, 8);
        db.query("update users set Password = ? where email = ?", [
          hashed,
          user.email,
        ]);
      }
      if (name != user.Name) {
        db.query("update users set Name = ? where email = ?", [
          name,
          user.email,
        ]);
      }
      res.status(200).json({ message: "Information Updated." });
    }
  } else {
    res
      .status(200)
      .json({ message: "Kindly Enter Old Password to Make Changes" });
  }
};

exports.header = (req, res) => {
  let user = Verifier(req);
  return user;
};

exports.getpricing = (req, res) => {
  res.render("Pricing", { header: this.header(req, res) });
};

exports.postpricing = (req, res) => {
  const user = Verifier(req);
  if (user) {
    console.log(req.body.plan);
    db.query(
      "Select * from packages where PId = ?",
      req.body.plan,
      (err, result) => {
        if (err) {
          console.log(err);
          console.log("Database Not Configured.");
          res.status(404).json("Data Base Issue");
        } else {
          if (result.length >= 0) {
            console.log(result[0]);
            res
              .status(200)
              .json({ message: "Data Base Issue", url: result[0].URL });
            //res.render("Pricing",{header:this.header(req,res),});
          }
        }
      }
    );
  } else {
    res.status(200).json({ message: "Login", url: "/Login" });
  }

  //res.render("Pricing",{header:this.header(req,res)});
};

exports.Stripe = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  //console.log(request.body.type);
  // console.log(
  //   "================================================================"
  // );
  //console.log(request.body);
  // console.log("Hello World");
  switch (request.body.type) {
    case "charge.succeeded":
      id = request.body.request.id;
      key = request.body.request.idempotency_key;
      email = request.body.data.object.billing_details.email;
      amount = (request.body.data.object.amount)/100;
      //Received Amount is Actual Amount * 100;Dollars
      db.query(
        "INSERT INTO stripepayment (id, idempotency, email, Status,amount) VALUES (?, ?, ?, 1,?);",
        [id, key, email,amount],
        (err, res) => {
          if (res) {
            console.log(request.body);
          }
        }
      );
      response.send();
    case "payment_intent.succeeded":
      id = request.body.request.id;
      key = request.body.request.idempotency_key;
      db.query(
        "select * from stripepayment where id = ? and idempotency = ?",
        [id, key],
        (err, pay) => {
          if(err){console.log(err);}
          if (pay.length>=0) {
            db.query(
              "update stripepayment set status = 2 where id = ? and idempotency = ?",
              [id, key],
              (err, res1) => {
                if(res1.affectedRows>0){
                  //console.log("STATUS Updated");
                  db.query("Select * from packages where Price = ?",[pay[0].amount],(err,Pack)=>{
                    if(Pack.length>0){
                      
                  //console.log("Package Checked");
                      db.query("select * from users where email = ? ",[pay[0].email],(err,usrdetail)=>{
                        if(usrdetail.length>0){
                          
                  //console.log("User Checked");
                          db.query("select * from useable where UID = ? ",[usrdetail[0].ID],(err,resources)=>{
                            
                  //console.log("Resources Checked");
                            if(resources.length>0){
                              let Prompts = Pack[0].Chat_Prompt;
                              let Images = Pack[0].Image_Prompt;
                              if (resources[0].Prompts < 10000)
                              {
                                Prompts = Prompts+resources[0].Prompts;
                              }
                              if(resources[0].Images<1000){
                                Images = Images + resources[0].Images;
                              }
                              //console.log(Prompts);
                              
                              //console.log(Images);
                              //console.log(usrdetail[0].ID);
                              db.query("UPDATE `useable` SET `Prompts`=?,`Images`=? WHERE UID = ? ",[Prompts,Images,usrdetail[0].ID],(err,resources1)=>{if(resources1){response.send();}});
                            }
                          });
                        }
                      });
                    }
                  });
                }
              }
            );
            //console.log(res);
          }
        }
      );
      response.send();
  }
};
