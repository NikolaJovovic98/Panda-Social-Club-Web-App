const {Sequelize} = require("sequelize");
const db = require("../config/db");
const Users = require("./Users");
const Posts = require("./Posts");

const Likes = db.define("like",{
    userId:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull:false,
        references: {
            model: Users,
            key: "id"
        }
    },
    postId:{
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        references: {
            model: Posts,
            key: "id"
        }
    }
},{timestamps:false});

Posts.hasMany(Likes,{onDelete:"cascade",hooks:true});
Users.hasMany(Likes,{onDelete:"cascade",hooks:true});
Likes.belongsTo(Posts,{foreignKey:"postId",targetKey:"id",onDelete:"cascade"});
Likes.belongsTo(Users,{foreignKey:"userId",targetKey:"id",onDelete:"cascade"});

module.exports = Likes; 