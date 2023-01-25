const accountSid = "AC9019cc2c84c9522ca0c6bace00f7479a";
const authToken = "304c841cca8c25cfb3d2d9a35aa9b0cf";
const verifySid = "ZS40cfbc796a9c331af6ca09e6514fd874";
const client = require("twilio")(accountSid, authToken);

const express = require('express')
// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure


module.exports={
  sentotp :(number) =>{
    client.verify.v2 
  .services(verifySid)
  .verifications.create({ to: `+91 ${number} `, channel: "sms" })
 },
    check: async (otpCode,number) => {
          try{
    const status = await client.verify.v2
              .services(verifySid)
              .verificationChecks.create({ to: `+91 ${number}`, code: otpCode });
               return status
          }catch(err){
              console.log(err);
          }   
      }
    }
    

    