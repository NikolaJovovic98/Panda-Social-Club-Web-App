const { Sequelize } = require("sequelize");
const db = require("../config/db");

const Users = db.define("user", {
    firstName: { type: Sequelize.STRING },
    lastName: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING, unique: true },
    email_verified: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    password: { type: Sequelize.STRING },
    google_id: { type: Sequelize.STRING },
    avatar: { type: Sequelize.STRING, defaultValue: "https://drive.google.com/uc?id=142WBnn4smv9Ipf8d0UVM_HTjIgQEkR7m" },
    avatar_id: {type: Sequelize.STRING, defaultValue:null},
    role: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    about_me: { type: Sequelize.STRING },
    cover_photo: { type: Sequelize.STRING, defaultValue: "https://drive.google.com/uc?id=1TLU1K1AozzF6hrooGULh6P_obL6C7MdQ" },
    cover_photo_id: {type: Sequelize.STRING, defaultValue:"1TLU1K1AozzF6hrooGULh6P_obL6C7MdQ"},
    location: { type: Sequelize.STRING, defaultValue: "Remote" },
    two_factor_auth: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    otc: { type: Sequelize.STRING, defaultValue: null }
});

module.exports = Users;