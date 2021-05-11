const db = require("../config/db");
const Users = require("../models/Users");

module.exports = (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { firstName, lastName, email, password, password2} = userData;
            mimetype = userData.mimetype;
            const user = await Users.findOne({where:{email:email}});
            const rePasswordNumber = /[0-9]/;
            const rePasswordLowerCase = /[a-z]/;
            const rePasswordUpperCase = /[A-Z]/;
            const reEmail = /\S+@\S+\.\S+/;
            const errors = [];
            if (firstName.length < 1 || lastName.length < 1 || email.length < 1 || password.length < 1  || password2.length<1) {
                errors.push({ msg: "Must fill all fields." });
            }
            if (password.length < 6) {
                errors.push({ msg: "Password must be minimum 6 characters long." });
            }
            if (!rePasswordNumber.test(password)) {
                errors.push({ msg: "Password must contain at least one number." });
            }
            if (!rePasswordLowerCase.test(password)) {
                errors.push({ msg: "Password must contain at least one lowercase letter." });
            }
            if (!rePasswordUpperCase.test(password)) {
                errors.push({ msg: "Password must contain at least one uppercase letter." });
            }
            if (!reEmail.test(email)) {
                errors.push({ msg: "Email is not in valid form." });
            }
            if (password !== password2) {
                errors.push({ msg: "Passwords don't match." });
            }
            if(user){
                errors.push({msg:"User with same email already exist."});
            }
            if(mimetype !== "image/jpeg" && mimetype !== "image/jpg" && mimetype !== "jpg" && mimetype !== "png" && mimetype !=="jpeg" ){
                errors.push({msg:"Wrong image type."});
            }
            resolve(errors);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
};
