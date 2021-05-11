const {Sequelize} = require("sequelize");
const db = require("../config/db");
const Users = require("./Users");
const Posts = require("./Posts");

const Comments = db.define("comment",{
    text:{
        type:Sequelize.STRING,
        allowNull:false
    },
    postId:{
        type: Sequelize.INTEGER,
        allowNull:false,
        references: {
            model: Posts,
            key: "id"
        }
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull:false,
        references: {
            model: Users,
            key: "id"
        }
    }
});

Users.hasMany(Comments,{onDelete:"cascade",hooks:true});
Posts.hasMany(Comments,{onDelete:"cascade",hooks:true});
Comments.belongsTo(Users,{foreignKey:"userId",targetKey:"id",onDelete:"cascade"});
Comments.belongsTo(Posts,{foreignKey:"postId",targetKey:"id",onDelete:"cascade"});

module.exports = Comments; 