require("dotenv").config();
const nodemailer = require("nodemailer");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = (adminsEmails, userWhoPosted,postInfo) => {
    return new Promise((resolve, reject) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_NAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            const mailOptions = {
                from: "dzonnna@gmail.com",
                to: adminsEmails,
                subject: "User added new post",
                html: `<div>
                        <h2>Admin Team Message</h2>
                        <p>
                            Hi admin team! please review new post
                            added by user in order to approve it to be
                            published.
                        </p>
                        <hr>
                        <p style="font-style: italic;">
                            User: <strong> ${userWhoPosted.firstName} ${userWhoPosted.lastName} id: ${userWhoPosted.id} </strong> <br>
                            Post: <strong> id: ${postInfo.id} date: ${postInfo.createdAt} </strong>
                        </p>
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