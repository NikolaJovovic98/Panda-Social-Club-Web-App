const { request } = require("express");
const Followings = require("../models/Followings");
const db = require("../config/db");

function follow(userId,followerId){
    return new Promise((resolve,reject)=>{
        try {
            resolve(
                Followings.create({
                    userId:userId,
                    followerId:followerId
                })
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function unFollow(userId,followerId){
    return new Promise((resolve,reject)=>{
        try {
            resolve(
                Followings.destroy(
                    {where:{
                        userId:userId,
                        followerId:followerId
                    }}
                )
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

function getUsersFollowers(userId){
    return new Promise(async(resolve,reject)=>{
        try {
            const followers = await db.query(`SELECT * FROM users
            WHERE users.id IN (SELECT followerId FROM followings WHERE userId = ${userId}) ORDER BY lastName ASC`);
            resolve(
                followers[0]
            );
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}

module.exports = {
  follow,
  unFollow,
  getUsersFollowers
};