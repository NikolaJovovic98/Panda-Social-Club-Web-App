const {Sequelize} = require("sequelize");
const db = require("../config/db");
const Users = require("./Users");

const Followings = db.define("following",{
    userId:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull:false,
        references: {
            model: Users,
            key: "id"
        }
    },
    followerId:{
        type: Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        references: {
            model: Users,
            key: "id"
        }
    }
},{timestamps:false});

// Users.hasMany(Posts,{onDelete:"cascade",hooks:true});
// Posts.belongsTo(Users,{foreignKey:"userId",targetKey:"id",onDelete:"cascade"});

module.exports = Followings; 