const Users = require("../models/Users");
const Users_Controller = require("../controllers/UsersController");
const jwt = require("jsonwebtoken");
const path = require("path");

module.exports = {
    isAuth: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        // req.flash("error_messages", "Please login to view this resource");
        return res.redirect("/login");
        // let loginPagePath = path.join(__dirname,"../","public","views","login.hbs");
        // return res.status(401).sendFile(loginPagePath);
    },
    isAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === "1") {
            return next();
        }
        req.flash("error_messages", "Not authorized to view this resource only for admins!");
        return res.redirect("/");
    },
    isDoubleAuth: (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }
        return next();
    },
    checkUserToken: async (req, res, next) => {
        if (req.params.token) {
            try {
                const token = req.params.token;
                const user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
                const findUser = await Users.findOne({ where: { id: user.id } });
                const otc_token = jwt.verify(findUser.otc, process.env.JWT_PRIVATE_KEY);
                if (!findUser || !otc_token) {
                    return res.redirect("/");
                }
                return next();
            } catch (error) {
                if (error.message = "jwt malformed") {
                    return res.redirect("/");
                }
            }
        } else {
            return res.redirect("/");
        }
    },
    isEmailValid: async (req, res, next) => {
        const input_email = req.body.reset_password_email;
        const user = await Users.findOne({ where: { email: input_email } });
        if (!user) {
            req.flash("error_messages", "No such user");
            res.redirect("/users/forgot-password-email");
        } else {
            return next();
        }
    },
    checkResetPasswordToken: async (req, res, next) => {
        if (req.params.token) {
            try {
                const token = req.params.token;
                const decryptToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
                const user = await Users_Controller.getUserByEmail(decryptToken.email);
                if (user) {
                    //ako je iat veci ne valja
                    const date = new Date(decryptToken.iat * 1000)
                    const userLastUpdate = user.updatedAt;
                    if (date < userLastUpdate) {
                        return res.redirect("/");
                    } else {
                        return next();
                    }
                } else {
                    return res.redirect("/")
                }
            } catch (error) {
                if (error.message = 'jwt malformed') {
                    return res.redirect("/");
                }
            }
        } else {
            return res.redirect("/");
        }
    }
}