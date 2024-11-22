//VideoSchema.js
const {DataTypes} = require('sequelize');
const sequelize = require('../database/database');
const User = require('./UserSchema');

const Video = sequelize.define('Video', {
    id: {type:DataTypes.INTEGER, autoIncrement:true, primaryKey:true},
    userId: {
        
        type:DataTypes.INTEGER,
        references: {model: User, key: 'id'},
        allowNull:false
    },
    Url: {type:DataTypes.STRING, allowNull:false},
    video_name: {type:DataTypes.STRING, allowNull:false},
    createdAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
});

//foreign key relationship
//Video.belongsTo(User, {foreignKey: 'userId'});

module.exports = Video;