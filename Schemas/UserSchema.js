//UserSchema.js
const {DataTypes} = require('sequelize');
const sequelize = require('../database/database');
//const Video = require('./VideoSchema');

const User = sequelize.define('User', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    email: {type: DataTypes.STRING, allowNull:false, unique:true},
    username: {type: DataTypes.STRING, allowNull:false, unique:true},
    password: {type: DataTypes.STRING, allowNull:false, unique:true},
    emailVtoken: {type: DataTypes.STRING, allowNull:true},
    isVerified: {type: DataTypes.BOOLEAN, allowNull:true},
    passwordVtoken: {type: DataTypes.STRING, allowNull:true}
});

//foreign key relationship
//User.hasMany(Video, {foreignKey: 'UserId', as: 'videoList'});
//Video.belongsTo(User, {foreignKey: 'userId'});

module.exports = User;