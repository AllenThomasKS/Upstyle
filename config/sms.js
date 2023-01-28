const fast2sms = require("fast-two-sms");

const sendMessage = function (mobile, res) {
  let randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    authorization:
      "0HjvrhqJABd2itKeTUGDfgS7luM36WcNYwyIVPLx15ZoC4QXbsjzNEOoGtw20XV9TkLUP3vR7eQKrnb4",
    message: `your OTP verification code is ${randomOTP}`,
    numbers: [mobile],
  };
  //send this message
  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("otp sent successfully");
    })
    .catch((error) => {
      console.log(error);
    });
  return randomOTP;
};

mod;
