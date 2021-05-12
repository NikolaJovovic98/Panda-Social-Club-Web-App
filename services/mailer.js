require("dotenv").config();
const nodemailer = require("nodemailer");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = (sendMailTo, secretCode) => {
    // const link =`http://localhost:3000/users/verify/${secretCode}`
    const link = `https://panda-social-club-mne.herokuapp.com/verify/${secretCode}`;
    return new Promise((resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_NAME ,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            const mailOptions = {
                from: "dzonnna@gmail.com",
                to: sendMailTo,
                subject: "Successfully Registered To Panda!",
                html: `<div>
                        <h2>Hi nice to see you!</h2>
                        <p>
                            Please verify your email in order to login.
                            After that you can login regularly.
                        </p>
                        <button><a href="${link}">VERIFY EMAIL</a></button>
               </div>`
            }
            
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log("Error in sending email: " + err);
                    resolve(false);
                }
                else {
                    console.log("Email sent! " + info.response);
                    resolve(true);
                }
            });
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}