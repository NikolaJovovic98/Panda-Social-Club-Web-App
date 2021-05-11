const Users = require("../models/Users");
const userValidation = require("../validation/userValidation");
const bcrypt = require("bcrypt");
const mailer = require("../services/mailer");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const imageUploader = require("../services/imageUpload");
const imageData = require("../services/getImageDimensions");
const { sanitize_credentials } = require("../services/xss_sanitize");
const { upload_to_google_drive } = require("../services/google_drive_api");
const { delete_from_google_drive } = require("../services/google_drive_api");
const path = require("path");

function register(userData, image) {
    return new Promise(async (resolve, reject) => {
        try {
            userData.mimetype = image.mimetype;
            const validator = await userValidation(userData);
            if (validator.length !== 0) {
                resolve(validator);
            } else {
                await imageUploader(image); // upload image to express server
                const image_path = path.join(__dirname, "../public/images/", image.name); // get image path after upload
                const upload_data = await upload_to_google_drive(image.name, image.mimetype, image_path); // upload image to google drive
                //and get image id and image public url 
                userData.firstName = await sanitize_credentials(userData.firstName);
                userData.lastName = await sanitize_credentials(userData.lastName);
                userData.email = await sanitize_credentials(userData.email);
                userData.password = await bcrypt.hash(userData.password, 10);
                const newUser = await Users.create(userData);
                await Users.update(
                    {
                        avatar: upload_data.image_url,
                        avatar_id: upload_data.id
                    },
                    { where: { id: newUser.id } }
                );
                const userPayload = {
                    id: newUser.id,
                    userName: newUser.email
                }
                const token = jwt.sign(userPayload, process.env.JWT_PRIVATE_KEY);
                await mailer(newUser.email, token);
                resolve(
                    newUser
                );
            }
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function enableTwoFactorAuth(userId, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await Users.findOne({ where: { id: userId } });
            if (user.google_id !== null) {
                reject({
                    error: true,
                    message: 'No 2fa with google auth',
                    status: 405
                });
            } else {
                const passedPassword = password;
                const userPassword = user.password;
                const passwordsMatch = await bcrypt.compare(passedPassword, userPassword);
                if (!passwordsMatch) {
                    reject({
                        error: true,
                        message: 'Incorrect password',
                        status: 405
                    });
                } else {
                    resolve(
                        Users.update(
                            { two_factor_auth: "1" },
                            { where: { id: userId } }
                        )
                    );
                }
            }
        } catch (error) {
            reject({
                error: true,
                message: 'Something went wrong.',
                status: 501
            })
        }
    });
}

function disableTwoFactorAuth(userId, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const passedPassword = password.password;
            const user = await Users.findOne({ where: { id: userId } });
            const userPassword = user.password;
            const passwordsMatch = await bcrypt.compare(passedPassword, userPassword);
            if (passwordsMatch) {
                resolve(
                    Users.update(
                        { two_factor_auth: "0" },
                        { where: { id: userId } }
                    )
                );
            } else {
                reject({
                    error: true,
                    message: 'Incorrect password',
                    status: 406
                });
            }
        } catch (error) {
            reject({
                error: true,
                message: 'Something went wrong.',
                status: 500,
                err_msg
            })
        }
    });
}

function updateOTC(userId, cryptedJwtCode) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Users.update(
                    { otc: cryptedJwtCode },
                    { where: { id: userId } }
                )
            )
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function clearOTC(userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Users.update(
                    { otc: null },
                    { where: { id: userId } }
                )
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function updateUser(newData, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            newData.firstName = await sanitize_credentials(newData.firstName);
            newData.lastName = await sanitize_credentials(newData.lastName);
            newData.location = await sanitize_credentials(newData.location);
            newData.about_me = await sanitize_credentials(newData.about_me);
            const update = await Users.update(
                {
                    firstName: newData.firstName,
                    lastName: newData.lastName,
                    location: newData.location,
                    about_me: newData.about_me
                },
                { where: { id: userId } }
            );
            resolve(update);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}


function updateUserAvatar(image, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await Users.findOne({ where: { id: userId } });
            await imageUploader(image);
            const image_path = path.join(__dirname, "../public/images/", image.name);
            await delete_from_google_drive(user.avatar_id);
            const update_image = await upload_to_google_drive(image.name, image.mimetype, image_path);
            await Users.update(
                {
                    avatar: update_image.image_url,
                    avatar_id: update_image.id
                },
                {
                    where:
                        { id: userId }
                }
            );
            resolve(true);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function updateUserCoverPhoto(image_cover, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            await imageUploader(image_cover);
            const dimensions = await imageData(image_cover.name);
            if (dimensions.width > dimensions.height) {
                const user = await Users.findOne({ where: { id: userId } });
                const image_path = path.join(__dirname, "../public/images/", image_cover.name);
                await delete_from_google_drive(user.cover_photo_id);
                const update_image = await upload_to_google_drive(image_cover.name, image_cover.mimetype, image_path);
                await Users.update(
                    {
                        cover_photo: update_image.image_url,
                        cover_photo_id: update_image.id
                    },
                    {
                        where:
                            { id: userId }
                    }
                );
                resolve(true);
            } else {
                reject({
                    error: true,
                    message: 'Cover must be landscape (Width>Height)',
                    status: 406
                });
            }
        } catch (error) {
            console.log("Error in updating user cover photo... " + error);
            reject(false);
        }
    });
}

function changePassword(passwordData, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const oldPassword = passwordData.oldPassword;
            const newPassword = passwordData.newPassword;
            const confirmNewPassword = passwordData.confirmNewPassword;
            const user = await Users.findOne({ where: { id: userId } });
            const validatePassword = await bcrypt.compare(oldPassword, user.password);
            if (!validatePassword || (newPassword !== confirmNewPassword)) {
                reject({
                    error: true,
                    message: 'Incorrect password or passwords do not match.',
                    status: 406
                });
            } else {
                const hashNewPassword = await bcrypt.hash(newPassword, 10);
                resolve(
                    Users.update({ password: hashNewPassword }, { where: { id: userId } })
                );
            }
        } catch (error) {
            reject({
                error: true,
                message: 'Something went wrong while changing password.',
                status: 500,
                err_msg
            })
        }
    });
}

function resetPassword(userId, newPassword) {
    return new Promise(async (resolve, reject) => {
        try {
            const hashNewPassword = await bcrypt.hash(newPassword, 10);
            resolve(
                Users.update(
                    { password: hashNewPassword },
                    {
                        where: {
                            id: userId
                        }
                    }
                )
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getAllUsers() {
    return new Promise(async (resolve, reject) => {
        try {
            const allUsers = await db.query(`
            SELECT users.id,users.firstName,users.lastName,users.avatar,users.role,COUNT(posts.userId) as numOfPosts
            FROM users
            LEFT JOIN posts ON users.id = posts.userId
            GROUP BY users.id
            ORDER BY numOfPosts DESC`);
            resolve(
                allUsers
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getUserById(userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Users.findOne({ where: { id: userId } })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function checkFollowing(loggedUserId, profileUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            const followers = await db.query(`SELECT users.id, users.firstName FROM users WHERE users.id IN (SELECT followerId FROM followings WHERE userId = ${loggedUserId})`);
            const followersIds = followers[0].map(follower => {
                return follower.id;
            });
            let flag = false;
            followersIds.map(id => {
                if (id === profileUserId) {
                    flag = true;
                }
            });
            resolve(flag);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function makeAdmin(userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Users.update({
                    role: "1"
                }, { where: { id: userId } })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function removeAdmin(userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Users.update({
                    role: "0"
                }, { where: { id: userId } })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function removeUser(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const removeUser = await Users.destroy({
                where: {
                    id: userId
                }
            });
            resolve(removeUser);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function verifyEmail(userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Users.update(
                    { email_verified: true },
                    {
                        where:
                            { id: userId }
                    })
            )
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getUserByEmail(userEmail) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Users.findOne({ where: { email: userEmail } })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function userFollowers(userId) {
    return new Promise((resolve, reject) => {
        try {
            const followers = db.query(`
            SELECT *
            FROM users
            WHERE users.id
            IN ( SELECT followerId FROM followings WHERE userId = ${userId})`);
            resolve(followers);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function mutualFollowers(loggedUserId, profileUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            const queryMutualFollowers = await db.query(`
                WITH firstUser AS (
                    SELECT followings.followerId as followerId
                    FROM followings
                    WHERE userId = ${loggedUserId}
                )
                , secondUser AS (
                    SELECT followings.followerId as secondFollowerId
                    FROM followings
                    WHERE userId = ${profileUserId}
                )
                SELECT COUNT(followerId) as mutual_followers
                FROM firstUser
                INNER JOIN secondUser ON firstUser.followerId = secondUser.secondFollowerId
            `);
            const numOfMutualFollowers = queryMutualFollowers[0][0].mutual_followers;
            resolve(numOfMutualFollowers);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

module.exports = {
    register,
    verifyEmail,
    updateUser,
    updateUserAvatar,
    updateUserCoverPhoto,
    changePassword,
    getAllUsers,
    getUserById,
    checkFollowing,
    makeAdmin,
    removeUser,
    removeAdmin,
    userFollowers,
    mutualFollowers,
    enableTwoFactorAuth,
    disableTwoFactorAuth,
    clearOTC,
    updateOTC,
    getUserByEmail,
    resetPassword
}