import User from "../models/model.js";

export const isLogin = async (req, res, next) => {
  if (req.session.user) {
    const user = User.findById(req.session.user._id);
    if (!user.isActive) {
      req.session.destroy();
      return res.redirect("/login");
    }
    console.log("user session", req.session.user);

    return res.redirect("/userhome");
  }
  next();
};

export const isNotLogin = async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  console.log("user session", req.session.user);
  next();
};

export const isAdminLogin = async (req, res, next) => {
  if (req.session.admin) {
    return res.redirect("/admin/dashboard");
  }
  next();
};

export const isAdminNotLogin = async (req, res, next) => {
  if (!req.session.admin) {
    console.log(req.session.admin);
    return res.redirect("/admin/");
  }
  next();
};
