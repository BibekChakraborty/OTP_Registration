require("dotenv/config");
const bcrypt = require("bcrypt");
const axios = require("axios");
const twilio = require("twilio");

const otpGenerator = require("otp-generator");

const { User } = require("../model/UserModel");
const { Otp } = require("../model/otpModel");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

module.exports.signUp = async (req, res) => {
  const ip =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    " ";
  console.log(`I.P Address is : ${ip}`);

  const user = await User.findOne({
    number: req.body.number,
  });
  if (user) {
    return res.status(400).send("User already exists");
  }
  const OTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });

  const number = req.body.number;
  console.log(OTP, number);

  const client = twilio(accountSid, authToken, {
    lazyLoading: false,
  });

  client.messages
    .create({
      body: `Your OTP is ${OTP}`,
      to: number,
      from: process.env.ADMIN_NUMBER,
    })
    .then((message) => console.log(message))
    .catch((err) => console.log(err));

  const otp = new Otp({ number: number, otp: OTP });
  const salt = await bcrypt.genSalt(10);
  otp.otp = await bcrypt.hash(otp.otp, salt);
  const resultOTP = await otp.save();
  return res.status(200).send("OTP send successfully");
};

module.exports.verify = async (req, res) => {
  const otpHolder = await Otp.find({
    number: req.body.number,
  });
  if (otpHolder.length === 0) return res.status(400).send("Expired OTP");

  const latestOtp = otpHolder[otpHolder.length - 1];
  const validUser = await bcrypt.compare(req.body.otp, latestOtp.otp);
  if (req.body.number === latestOtp.number && validUser) {
    const user = new User({ number: req.body.number });
    const result = await user.save();
    const deleteOTP = await Otp.deleteMany({
      number: latestOtp.number,
    });
    return res.status(200).send({
      message: "User verified successfully.",
      data: result,
    });
  } else {
    return res.status(400).send("Incorrect OTP");
  }
};
