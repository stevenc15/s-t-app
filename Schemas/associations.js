//associations.js
const User = require('./UserSchema');
const Video = require('./VideoSchema');

// Define associations here
User.hasMany(Video, { foreignKey: 'userId', as: 'videoList', onDelete: 'CASCADE' });
Video.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Video };