const session = require("express-session");

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

const isLogout = (req, res, next) => {
  try {
    if (req.session.user_id) {
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
