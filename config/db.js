// var sequelize = new Sequelize('mysql://root:ducsnj18977@localhost:3306/panda_db');
const { Sequelize } = require("sequelize");
const db = new Sequelize(process.env.CLEARDB_DATABASE_URL, {
  // host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: false, // prikazivanje querija u terminal da/ne
});


// const { Sequelize } = require("sequelize");
// const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST,
//   dialect: 'mysql',
//   pool: {
//     max: 5,
//     min: 0,
//     idle: 10000
//   },
//   logging: false // prikazivanje querija u terminal da/ne
// });


module.exports = db;