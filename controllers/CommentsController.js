const Comments = require("../models/Comments");
const Posts = require("../models/Posts");
const Users = require("../models/Users");

function addComment(text, postId, userId) {
    return new Promise((resolve, reject) => {
        try {
            resolve(
                Comments.create({
                    text: text,
                    postId: postId,
                    userId: userId
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}


function deleteComment(commentId, userId, postId) {
    return new Promise(async (resolve, reject) => {
        try {
            const comment = await Comments.findOne({ where: { id: commentId } });
            const post = await Posts.findOne({ where: { id: postId } });
            if(comment.userId === userId || (comment.postId === postId && post.userId === userId)){
                resolve(
                    Comments.destroy({
                        where: {
                            id: commentId
                        },
                    }))
            }
            else {
                reject(false);
            }
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

module.exports = {
    addComment,
    deleteComment
};