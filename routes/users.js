const router = require("express").Router();
const Users = require("../controllers/UsersController");
const passport = require("passport");
const jwt = require('jsonwebtoken');
const { isAuth, isDoubleAuth, checkUserToken, isEmailValid, checkResetPasswordToken } = require("../services/authMiddleware");
const Posts = require("../controllers/PostsController");
const Followings = require("../controllers/FollowingsController");
const generateOTC = require("../services/generateOTP");
const userMailer = require("../services/userNotifyMailer");
const rateLimit = require("express-rate-limit");
const path = require("path");
const lodash = require("lodash");


function getTime(date) {
    const hours = date.getHours();
    let minutes = date.getMinutes();
    if (parseInt(minutes) < 10) {
        minutes = minutes.replace(/^/, '0');
    }
    return (hours + ":" + minutes);
}

const loginLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, //3 minutes in milliseconds
    max: 3, // max 3 requests
    // message: "Request limit exceeded, try again in 3 minutes",
    handler: (req, res) => {
        const untill_time = getTime(req.rateLimit.resetTime);
        req.flash("error_messages", `Request limit exceeded, try again in 3 minutes untill: ${untill_time}`);
        return res.redirect("/login");
    }
});

router.post("/register", isDoubleAuth, async (req, res) => {
    try {
        const image = req.files.avatar;
        const message = await Users.register(req.body, image);
        if (!message.id) {
            req.flash("error_messages", "Invalid input, try again.");
            res.redirect("/register");
        } else {
            req.flash("success_messages", "You have successfully registered please verify your email in order to login.");
            res.redirect("/login");
        }
    } catch (error) {
        res.status(403).json(error);
    }
});

// router.post("/login", isDoubleAuth,
//     passport.authenticate('local', {
//         successRedirect: '/',
//         failureRedirect: '/login',
//         failureFlash: true,
//         successFlash: true
//     })
// );

router.post("/login",
    isDoubleAuth,
    loginLimiter,
    async (req, res, next) => {
        console.log("Attempt to login: " + new Date);
        passport.authenticate('local', async (error, user, info) => {
            if (error) {
                return next(error);
            }
            if (info.message === "User does not exist. Register if you don't have an account.") {
                req.flash("error_messages", info.message);
                res.redirect("/login");
            }
            if (info.message === "You need to login with google account.") {
                req.flash("error_messages", info.message);
                res.redirect("/login");
            }
            if (info.message === "Incorrect password, try again.") {
                req.flash("error_messages", info.message);
                res.redirect("/login");
            }
            if (info.message === "Please verify your email first.") {
                req.flash("error_messages", info.message);
                res.redirect("/login");
            }
            if (info.message === "Successful Login.") {
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                });
                req.flash("success_messages", info.message);
                res.redirect("/");
            }
            if (info.message === "2FA") {
                try {
                    const code = await generateOTC(); //generate 4 digit code
                    await userMailer.userTwoFactorCodeNotify(user.email, user.firstName, code); //send code to users email
                    const userPayload = {
                        id: user.id,
                        email: user.email
                    }
                    const codePayload = {
                        code
                    }
                    const userToken = jwt.sign(userPayload, process.env.JWT_PRIVATE_KEY, { expiresIn: 30 * 10 }); // encrypt user data
                    const codeToken = jwt.sign(codePayload, process.env.JWT_PRIVATE_KEY, { expiresIn: 30 * 10 }); // encrypt code expires in 5 minutes
                    setTimeout(async () => {
                        await Users.clearOTC(user.id);
                    }, 10 * 30 * 1000); // clear user's otc after 5 minutes
                    await Users.updateOTC(user.id, codeToken); // update otc in user db
                    req.flash("orange_message", "Code is sent to your email account.Be advised it will expire in 5 minutes.");
                    res.redirect(`/users/2fa/${userToken}`); // pass userToken as parameter to url 
                } catch (error) {
                    console.log(error);
                    res.json(error);
                }
            }
        })(req, res, next)
    }
);

router.get("/2fa/:token", checkUserToken, isDoubleAuth, async (req, res) => {
    try {
        res.render("2fa.hbs", {
            token: req.params.token
        });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

router.post("/login/verify/2fa", async (req, res) => {
    const userToken = req.body.token; // user token
    const input_code = req.body.code; // input 4 digit code
    const userPayload = jwt.verify(userToken, process.env.JWT_PRIVATE_KEY); // user data
    const user = await Users.getUserById(userPayload.id); // get user from db
    const codePayload = jwt.verify(user.otc, process.env.JWT_PRIVATE_KEY); // get users otc and decrypt it
    const decrypted_user_code = codePayload.code; // decrypted otc from users db
    const userLoginData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        about_me: user.about_me,
        location: user.location,
        cover_photo: user.cover_photo,
        avatar: user.avatar,
        two_factor_auth: user.two_factor_auth,
        createdAt: user.createdAt
    }
    try {
        if (parseInt(input_code) === parseInt(decrypted_user_code)) {
            await Users.clearOTC(userLoginData.id); // clear otc from users db
            req.logIn(userLoginData, function (err) {
                if (err) {
                    return next(err);
                }
            });
            res.redirect("/");
        } else {
            await Users.clearOTC(userLoginData.id); // clear otc from users db
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

router.get("/forgot-password-email", isDoubleAuth, async (req, res) => {
    try {
        res.render("forgot-password-email.hbs");
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

router.post("/forgot-password-email", isDoubleAuth, isEmailValid, async (req, res) => {
    const input_email = req.body.reset_password_email;
    try {
        const user = await Users.getUserByEmail(input_email);
        const emailPayload = {
            email: input_email
        }
        const token = jwt.sign(emailPayload, process.env.JWT_PRIVATE_KEY, { expiresIn: '1h' });
        await userMailer.userResetPasswordNotify(user.email, user.firstName, token);
        req.flash("success_messages", "Link for password reset was sent to " + user.email);
        res.redirect("/users/forgot-password-email");
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

router.get("/reset-password/:token", isDoubleAuth, checkResetPasswordToken, async (req, res) => {
    const userToken = req.params.token;
    try {
        res.render("reset-password.hbs", {
            userToken
        });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

router.post("/reset-password", isDoubleAuth, async (req, res) => {
    const token = req.body.user_token;
    const newPassword = req.body.new_password;
    const newPasswordConfirm = req.body.confirm_new_password;
    try {
        const decryptedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        if (newPassword === newPasswordConfirm) {
            const user = await Users.getUserByEmail(decryptedToken.email);
            await Users.resetPassword(user.id, newPassword);
            await userMailer.userPasswordResetSuccessNotify(user.email, user.firstName);
            req.flash("success_messages", "Password changed");
            res.redirect("/login");
        } else {
            req.flash("error_messages", "Passwords do not match.");
            res.redirect(`/users/forgot-password-email/${token}`);
        }
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

router.post("/logout", isAuth, async (req, res) => {
    try {
        req.logOut();
        res.redirect("/login");
    } catch (error) {
        res.status(403).json(error);
    }
});

router.get("/verify/:secretCode", async (req, res) => {
    try {
        const token = req.params.secretCode;
        const user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        if (user) {
            await Users.verifyEmail(user.id);
            req.flash("success_messages", "Email verified successfully!");
            res.redirect("/login");
        } else {
            req.flash("error_messagges", "Token expired");
            res.redirect("/login");
        }
    } catch (error) {
        res.status(403).json(error);
    }
});

router.get("/google", isDoubleAuth, passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get("/google/redirect", isDoubleAuth, passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/',
    successFlash: true,
    failureFlash: true
}));

router.get("/edit-profile", isAuth, async (req, res) => {
    try {
        const followers = await Followings.getUsersFollowers(req.user.id);
        res.render("edit-profile.hbs", {
            loggedUser: req.user,
            followers: followers
        });
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/edit-profile", isAuth, async (req, res) => {
    try {
        await Users.updateUser(req.body,req.user.id);
        res.redirect(`/users/profile/${req.user.id}`);
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/change-avatar",isAuth,async (req,res)=>{
    try {
        const image = req.files.avatar;
        await Users.updateUserAvatar(image,req.user.id);
        res.redirect(`/users/profile/${req.user.id}`);
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/change-cover", isAuth, async (req, res) => {
    try {
        const image_cover = req.files.cover;
        await Users.updateUserCoverPhoto(image_cover, req.user.id);
        res.redirect(`/users/profile/${req.user.id}`);
    } catch (error) {
        if (error.message === "Cover must be landscape (Width>Height)") {
            req.flash("error_messages", error.message);
            res.redirect("/users/edit-profile");
        }
    }
});

router.post("/change-password", isAuth, async (req, res) => {
    try {
        await Users.changePassword(req.body, req.user.id);
        req.flash("success_messages", "Password changed.")
        res.redirect("/users/edit-profile");
    } catch (error) {
        if (error.message === "Incorrect password or passwords do not match.") {
            req.flash("error_messages", error.message);
            res.redirect("/users/edit-profile");
        }
    }
});


router.get("/profile/:userId", isAuth, async (req, res) => {
    const userId = req.params.userId;
    const loggedUser = req.user.id;
    try {
        const user = await Users.getUserById(userId); // radi
        const postsByUser = await Posts.getAllPostsByUser(user.id); // radi
        let isFollowing = await Users.checkFollowing(loggedUser, parseInt(userId)); // radi
        if (loggedUser === parseInt(userId)) {
            isFollowing = "loggedUserProfile";
        }
        const followers = await Followings.getUsersFollowers(loggedUser); // radi
        res.render("user-profile.hbs", {
            loggedUser: req.user,
            userProfile: user,
            posts: postsByUser,
            following: isFollowing,
            followers
        });
    } catch (error) {
        res.status(403).json(error);
    }
});

router.get("/all-users", isAuth, async (req, res) => {
    try {
        const allUsers = await Users.getAllUsers();
        const followers = await Followings.getUsersFollowers(req.user.id);
        res.render("all-users.hbs", {
            loggedUser: req.user,
            users: allUsers[0],
            followers: followers
        });
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/follow/:followerId", isAuth, async (req, res) => {
    try {
        await Followings.follow(req.user.id, req.params.followerId);
        const user = await Users.getUserById(req.params.followerId);
        req.flash("success_messages", `You are now following ${user.firstName}`);
        res.redirect(`/users/profile/${user.id}`);
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/unfollow/:followerId", isAuth, async (req, res) => {
    try {
        await Followings.unFollow(req.user.id, req.params.followerId);
        const user = await Users.getUserById(req.params.followerId);
        req.flash("unfollow_message", `You unfollowed ${user.firstName}`);
        res.redirect(`/users/profile/${user.id}`);
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/enable/2fa", isAuth, async (req, res) => {
    try {
        await Users.enableTwoFactorAuth(req.user.id, req.body.password);
        req.flash("success_messages", "You have turned 2FA on");
        res.redirect("/users/edit-profile");
    } catch (error) {
        if (error.message === "Incorrect password") {
            req.flash("error_messages", error.message);
            res.redirect("/users/edit-profile");
        }
        if (error.message === "No 2fa with google auth") {
            req.flash("error_messages", error.message);
            res.redirect("/users/edit-profile");
        }
    }
});

router.post("/disable/2fa", isAuth, async (req, res) => {
    try {
        await Users.disableTwoFactorAuth(req.user.id, req.body);
        req.flash("orange_message", "You have turned 2FA off");
        res.redirect("/users/edit-profile");
    } catch (error) {
        if (error.message === "Incorrect password") {
            req.flash("error_messages", error.message);
            res.redirect("/users/edit-profile");
        }
    }
});


module.exports = router;