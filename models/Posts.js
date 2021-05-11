const {Sequelize} = require("sequelize");
const db = require("../config/db");
const Users = require("./Users");

const Posts = db.define("post",{
    body:{
        type:Sequelize.STRING
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull:false,
        references: {
            model: Users,
            key: "id"
        }
    },
    is_approved:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
        
    }
});

Users.hasMany(Posts,{onDelete:"cascade",hooks:true});
Posts.belongsTo(Users,{foreignKey:"userId",targetKey:"id",onDelete:"cascade"});

module.exports = Posts; 