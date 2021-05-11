const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const Users = require("../models/Users");
const passport = require("passport");

module.exports = function () {
    passport.use(new LocalStrategy({ usernameField: "emailLogin", passwordField: "passwordLogin" }, async (email, password, done) => {
        const user = await Users.findOne({ where: { email: email } });
        if (!user) {
            return done(null, false, { message: "User does not exist. Register if you don't have an account." });
        }
        if(user.password == null){
            return done(null,false,{message: "You need to login with google account."});
        }
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            return done(null, false, { message: "Incorrect password, try again." });
        }
        if (user.email_verified == "0") {
            return done(null, false, { message: "Please verify your email first." });
        }
        if(user.two_factor_auth === "0"){
            return done(null, user, { message: "Successful Login." });
        }
            return done(null, user, { message: "2FA" });
    }));

    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/users/google/redirect",
    },
        async (accessToken, refreshToken, profile, done) => {
            const newUserObject = {
                google_id: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                email_verified: true
            };
            try {
                const user = await Users.findOne({ where: { google_id: profile.id } });
                const checkUserEmail = await Users.findOne({ where: { email: newUserObject.email,google_id:null } });
                if (user) {
                    done(null, user);
                } else if (checkUserEmail) {
                    done(null, false, { message: "User with same email already exist" });
                } else {
                    const newUser = await Users.create(newUserObject);
                    done(null, newUser);
                }
            } catch (error) {
                console.log(error);
            }
        }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async(id, done) => {
        Users.findByPk(id).then((user) => {
            const userObject = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role:user.role,
                about_me:user.about_me,
                location:user.location,
                cover_photo:user.cover_photo,
                cover_photo_id:user.cover_photo_id,
                avatar: user.avatar,
                avatar_id: user.avatar_id,
                two_factor_auth: user.two_factor_auth,
                createdAt: user.createdAt
            }
            done(null, userObject);
        }).catch(done);
    });
};


// moze i ovako
        // const user = await Users.findByPk(id);
        // const userObject = {
        //             id: user.id,
        //             firstName: user.firstName,
        //             lastName: user.lastName,
        //             email: user.email,
        //             role:user.role,
        //             about_me:user.about_me,
        //             location:user.location,
        //             cover_photo:user.cover_photo,
        //             avatar: user.avatar,
        //             two_factor_auth: user.two_factor_auth,
        //             createdAt: user.createdAt
        //         }
        // done(null, userObject);
