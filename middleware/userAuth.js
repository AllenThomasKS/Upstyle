const session = require("express-session");
const userModel = require('../model/userModel')

const isLogin = (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.render("home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async(req, res, next) => {
  try {
    const userData = await userModel.findById({_id: req.session.user_id})
    if (req.session.user_id && userData.isAvailable==true) {
      next();
    } else {
      const login = true;
      session = null;
      res.render("userLogin", { login, session });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {}
};

module.exports = {
  isLogin,
  isLogout,
  logout,
};
