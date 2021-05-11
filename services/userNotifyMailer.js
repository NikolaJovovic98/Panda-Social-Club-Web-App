require("dotenv").config();
const nodemailer = require("nodemailer");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const createTransporter = () => {
    return new Promise((resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_NAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            resolve(transporter);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

const userPostApprovedNotify = async (userEmail, userName) => {
    try {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail({
            from: "dzonnna@gmail.com",
            to: userEmail,
            subject: "Post approved",
            html: `<div>
                        <h2>Hi ${userName}</h2>
                        <p style="color:green">
                            Your post was approved by admin team!
                            you can now review it on homepage.
                        </p>
                    </div>`
        });
        console.log(`Email sent to ${userName} (Post Approved Notify)`);
    } catch (e) {
        console.log(e)
    }
}

const userPostRejectNotify = async (userEmail, userName) => {
    try {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail({
            from: "dzonnna@gmail.com",
            to: userEmail,
            subject: "Post rejected",
            html: `<div>
                        <h2>Hi ${userName}</h2>
                        <p style="color:red">
                            Unfortunately your post was rejected 
                            by admin team. You can try to publish new post.
                        </p>
               </div>`
        });
        console.log(`Email sent to ${userName} (Reject Post Notify)`);
    } catch (e) {
        console.log(e)
    }
}

const userPostDeletedNotify = async (userEmail, userName) => {
    try {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail({
            from: "dzonnna@gmail.com",
            to: userEmail,
            subject: "Post deleted",
            html: `<div>
                        <h2>Hi ${userName}</h2>
                        <p style="color:red">
                            Unfortunately your post was deleted 
                            by admin team. If you have any questions you can
                            contact our admin team by email. <br>
                            <a href = "mailto:dzonnna@gmail.com">Contact Us</a>
                        </p>
               </div>`
        });
        console.log(`Email sent to ${userName} (Delete Post Notify)`);
    } catch (e) {
        console.log(e)
    }
}

const userTwoFactorCodeNotify = async (userEmail, userName, code) => {
    try {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail({
            from: "dzonnna@gmail.com",
            to: userEmail,
            subject: "Two Factor Authentication",
            html: `<div>
                        <h2>Hello ${userName}</h2>
                        <p>
                         Someone made an account sign-in request. You need to confirm that it's you.
                        </p>
                        <br>
                        <p>
                         Please use code ~it will expire in 5 minutes~ below: 
                        </p>
                         <h1>${code}</h1>
                        <br><br>
                        <p>If it's not you, please change your password</p>
                     </div>`
        });
        console.log(`Email sent to ${userName} (2fa)`);
    } catch (e) {
        console.log(e)
    }
}

const userResetPasswordNotify = async (userEmail, userName, token) => {
    const link = `http://localhost:3000/users/reset-password/${token}`
    try {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail({
            from: "dzonnna@gmail.com",
            to: userEmail,
            subject: "Password Reset",
            html: ` <div>
                        <h2>Hello ${userName}</h2>
                            <p style="background-color:orangered;color:white;padding:5px;border-radius:10px">
                                A password reset for your account was requested.
                                Please click the button below to change your password.
                                Note that this link is valid for 1 hour. 
                                After the time limit has expired, 
                                you will have to resubmit the request for a password reset. 
                            </p>
                        <br>
                        <button><a href="${link}" >RESET PASSWORD LINK</a></button>
                    </div>`
        });
        console.log(`Email sent to ${userName} (reset password)`);
    } catch (e) {
        console.log(e)
    }
}

const userPasswordResetSuccessNotify = async (userEmail,userName)=>{
    try {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail({
            from: "dzonnna@gmail.com",
            to: userEmail,
            subject: "Changed Password",
            html: ` <div>
                        <h2>Hello ${userName}</h2>
                            <p style="background-color:orangered;color:white;padding:5px">
                            Your login password has been changed. If you believe this 
                            is an error, please click on the button below to 
                            visit our support portal, through which you can contact
                             our support team
                            </p>
                    </div>`
        });
        console.log(`Email sent to ${userName} (changed password)`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    userPostApprovedNotify,
    userPostRejectNotify,
    userPostDeletedNotify,
    userTwoFactorCodeNotify,
    userResetPasswordNotify,
    userPasswordResetSuccessNotify
}