const Likes = require("../models/Likes");

function like(userId,postId){
    return new Promise((resolve,reject)=>{
        try {
            resolve(
                Likes.create({
                    userId:userId,
                    postId:postId
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function unlike(userId,postId){
    return new Promise((resolve,reject)=>{
        try {
            resolve(
                Likes.destroy({
                    where:{
                        userId:userId,
                        postId:postId
                    }
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function checkLike(userId,postId){
    return new Promise(async(resolve,reject)=>{
        try {
            const like = await Likes.findOne({where:{userId:userId,postId:postId}});
            if(like){
                return resolve(true);
            }else{
                return resolve(false);
            }
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function countNumberOfLikes(postId){
    return new Promise((resolve,reject)=>{
        try {
            resolve(
                Likes.count({
                    where:{
                        postId:postId
                    }
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

module.exports = {
    like,
    unlike,
    checkLike,
    countNumberOfLikes
};