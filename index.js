const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require('mongoose');

const http = require('http');
const bcrypt = require("bcryptjs");
require('dotenv').config();
require('./database');

app.get("/", (req, res) =>
  res.send(`Server Running`)
);

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const jwt = require("jsonwebtoken");
// var nodemailer = require("nodemailer");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

require("./userModel");

const User = mongoose.model("UserInfo");

app.post("/register", async (req, res) => {
  const { name, email, password, cpassword } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await User.create({
      name,
      email,
      password: encryptedPassword,
      cpassword,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "60s",
    });

    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "Invalid Password" });
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) {
        return "token expired";
      }
      return res;
    });
    console.log(user);
    if (user == "token expired") {
      return res.send({ status: "error", data: "token expired" });
    }

    const useremail = user.email;
    User.findOne({ email: useremail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) {}
});

app.get("/getAllUser", async (req, res) => {
  try {
    const allUser = await User.find({});
    res.send({ status: "ok", data: allUser });
  } catch (error) {
    console.log(error);
  }
});

//get a user
app.get("/:id", async (req, res) => {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
     
    res.send({ status: "ok", data: user });
   
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/deleteUser", async (req, res) => {
  const { userid } = req.body;
  try {
    User.deleteOne({ _id: userid }, function (err, res) {
      console.log(err);
    });
    res.send({ status: "Ok", data: "Deleted" });
  } catch (error) {
    console.log(error);
  }
});

app.put("/:id", async (req, res) => {
  const {id} = req.params;
 
  try {
    const {name, email} = req.body;
    const user = await User.findByIdAndUpdate(id, {name, email});
await user.save();
   
    res.send({ status: "Ok", data: user });
  } catch (error) {
    console.log(error);
  }
});

// app.get('/logout',(req,res) => {
//   req.session.destroy();
//   res.redirect('/');
// });

app.listen(PORT, ()=>{
  console.log('listening to', PORT)
  });