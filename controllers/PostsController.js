const Posts = require("../models/Posts");
const Users = require("../models/Users");
const Comments = require("../models/Comments");
const db = require("../config/db");
const Sequelize = require('sequelize');
const Likes = require("../models/Likes");
const { Op } = Sequelize;
const adminMailer = require("../services/adminNewPostMail");
const userMailer = require("../services/userNotifyMailer");

function addNewPost(body, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const newPost = await Posts.create({
                body: body,
                userId: userId
            });
            const userWhoPosted = await Users.findOne({ where: { id: userId } });
            const admins = await Users.findAll({ where: { role: 1 } });
            const adminsMails = admins.map(admin => {
                return admin.email;
            });
            await adminMailer(adminsMails, userWhoPosted, newPost);
            resolve(
                newPost
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Posts.findAll({
                    include: [{
                        model: Users,
                        required: true
                    }],
                    where: { is_approved: true },
                    order: [['createdAt', 'DESC']]
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getAllPostsByUser(userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Posts.findAll({
                    include: [{
                        model: Users,
                        required: true
                    }],
                    where: { userId: userId, is_approved: true },
                    order: [['createdAt', 'DESC']]
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getPostById(postId) {
    return new Promise(async (resolve, reject) => {
        try {
            const post = await Posts.findOne({
                include: [{
                    model: Users,
                    required: true
                }],
                where: { id: postId, is_approved: true },
            });
            if (post) {
                resolve(post);
            } else {
                reject({
                    error: true,
                    message: 'Post is not approved yet...',
                    status: 404
                });
            }
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getCommentsByPost(postId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Comments.findAll({
                    include: [{
                        model: Users,
                        required: true
                    }],
                    where: { postId: postId },
                    order: [['createdAt', 'DESC']]
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    })
}

function getUsersWhoLiked(postId) {
    return new Promise(async (resolve, reject) => {
        try {
            const usersQuery = await db.query(`
            SELECT users.firstName,users.lastName
            FROM users
            INNER JOIN likes
            ON users.id = likes.userId
            WHERE likes.postId = ${postId}
            `);
            const usersWhoLikedPost = usersQuery[0].map(user => {
                return { fullName: user.firstName + " " + user.lastName }
            });
            resolve(usersWhoLikedPost);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getLikedPosts(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const likedPosts = await db.query(`
            SELECT posts.id as postId,posts.body,users.id as userId,users.firstName,users.lastName,users.avatar,posts.createdAt
            FROM posts
            INNER JOIN likes ON likes.postId = posts.id
            INNER JOIN users ON users.id = posts.userId
            WHERE likes.userId = ${userId}
            ORDER BY posts.createdAt DESC
            `);
            resolve(likedPosts);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function deletePost(postId, userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Posts.destroy({
                    where: {
                        id: postId,
                        userId: userId
                    },
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    })
}

function adminDeletePost(postId, adminId) {
    return new Promise(async (resolve, reject) => {
        try {
            const admin = await Users.findOne({ where: { id: adminId } });
            const post = await Posts.findOne({ where: { id: postId } });
            const user = await Users.findOne({ where: { id: post.userId } });
            if (admin.role === "1") {
                await userMailer.userPostDeletedNotify(user.email, user.firstName);
                resolve(
                    Posts.destroy({
                        where: {
                            id: postId
                        }
                    })
                );
            } else {
                reject(false);
            }
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function editPost(postId, userId, updateBody) {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(
                Posts.update(
                    {
                        body: updateBody
                    },
                    { where: { id: postId, userId: userId, is_approved: false } }
                )
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    })
}

function getHomePagePosts(loggedUserId){
    return new Promise(async (resolve,reject)=>{
        try {
            const query = await db.query(`
            SELECT  posts.id, posts.body,users.id as userId,users.firstName,users.lastName,users.avatar,posts.createdAt, t1.num_of_comments, t2.num_of_likes
            FROM posts
            LEFT JOIN (
              SELECT comments.postId, COUNT(*) AS num_of_comments
              FROM comments 
              GROUP BY comments.postId
            ) t1 ON t1.postId = posts.id
            LEFT JOIN (
              SELECT likes.postId, COUNT(*) AS num_of_likes
              FROM likes
              GROUP BY likes.postId
            ) t2 ON t2.postId = posts.id
            INNER JOIN users ON users.id = posts.userId
            WHERE users.id IN 
            (SELECT users.id
            FROM users
            WHERE users.id IN 
            ( SELECT followerId from followings where userId = ${loggedUserId})OR users.id = ${loggedUserId})
            AND posts.is_approved = 1
            ORDER BY createdAt DESC`);
            resolve(query);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

/*
function getHomePagePosts(loggedUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            const followers = await db.query(`
            SELECT users.id, users.firstName FROM users WHERE users.id IN 
            (SELECT followerId FROM followings WHERE userId = ${loggedUserId})`);
            const followersIds = followers[0].map(follower => {
                return follower.id;
            });
            followersIds.push(loggedUserId);
            const allHomePagePosts = await Posts.findAll({
                include: [{
                    model: Users,
                    required: true
                }],
                where: { userId: { [Op.in]: followersIds }, is_approved: true },
                order: [['createdAt', 'DESC']]
            });
            resolve(allHomePagePosts);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}
*/

//attributes je u stvari ono sto ide u SELECT
//include je ono sto ide u INNER JOIN
//group je ono GROUP BY
//order je ono ORDER BY
//attributes:[] stavljamo da ne bi uzimali sve podatke iz te tabele koju inkludujemo
//db.literal da bi mogli koristit ovo sto je count 


/*
RAW QUERY

SELECT users.id as userId,users.firstName,users.lastName,posts.id,posts.body,COUNT(likes.postId) as numOfLikes
FROM posts
INNER JOIN likes ON likes.postId = posts.id
INNER JOIN users ON users.id = posts.userId
GROUP BY posts.id
HAVING numOfLikes > 1
ORDER BY numOfLikes DESC
*/

function getPopularPosts() {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Posts.findAll({
                    attributes: [
                        'id', 'body', 'createdAt',
                        [db.fn('count', db.col('likes.postId')), 'numOfLikes'],
                        [db.col('User.id'), 'userId'],
                        'user.firstName',
                        'user.lastName',
                        'user.avatar'
                    ],
                    where: { is_approved: true },
                    include: [{ attributes: [], model: Likes, required: true, }, { attributes: [], model: Users, required: true }],
                    group: ['id'],
                    order: [[db.literal('numOfLikes'), 'DESC']],
                    having: {
                        numOfLikes: {
                            [Op.gt]: 2
                        }
                    },
                    raw: true,
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    })
}

function getPendingPosts(userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Posts.findAll({
                    include: [{
                        model: Users,
                        required: true
                    }],
                    where: { userId: userId, is_approved: false },
                    order: [['createdAt', 'DESC']]
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getPendingPostToEdit(postId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Posts.findOne({
                    where: { id: postId, is_approved: false },
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getAdminPendingPosts() {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Posts.findAll({
                    include: [{
                        model: Users,
                        required: true
                    }],
                    where: { is_approved: false },
                    order: [['createdAt', 'DESC']]
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function adminApprovePost(adminId, postId) {
    return new Promise(async (resolve, reject) => {
        try {
            const admin = await Users.findOne({ where: { id: adminId } });
            const post = await Posts.findOne({ where: { id: postId } });
            const user = await Users.findOne({ where: { id: post.userId } });
            if (admin.role === "1") {
                await userMailer.userPostApprovedNotify(user.email, user.firstName);
                resolve(
                    Posts.update(
                        {
                            is_approved: true
                        },
                        { where: { id: postId } }
                    )
                );
            } else {
                reject(false);
            }
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function adminRejectPost(adminId, postId) {
    return new Promise(async (resolve, reject) => {
        try {
            const admin = await Users.findOne({ where: { id: adminId } });
            const post = await Posts.findOne({ where: { id: postId } });
            const user = await Users.findOne({ where: { id: post.userId } });
            if (admin.role === "1") {
                await userMailer.userPostRejectNotify(user.email, user.firstName);
                resolve(
                    Posts.destroy({
                        where: {
                            id: postId
                        }
                    })
                );
            } else {
                reject(false);
            }
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

module.exports = {
    addNewPost,
    getAllPosts,
    getAllPostsByUser,
    getPostById,
    getCommentsByPost,
    deletePost,
    getLikedPosts,
    editPost,
    getHomePagePosts,
    getPopularPosts,
    getPendingPosts,
    getPendingPostToEdit,
    getAdminPendingPosts,
    adminApprovePost,
    adminRejectPost,
    adminDeletePost,
    getUsersWhoLiked
}