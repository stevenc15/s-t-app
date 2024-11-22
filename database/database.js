//all elements working=YES, includes the .env file
const {Sequelize} = require('sequelize');

const dotenv = require('dotenv');
if (process.env.NODE_ENV!=='test'){
    
    dotenv.config({path:'./backend_details.env'}); //relative to server.js location 
}
else{
    dotenv.config({path:'backend/backend_details.env'});//relative to root of project location
}
const useCloud = process.env.USE_CLOUD==='true';

let sequelize;
console.log(process.env.DB_USER);
console.log(process.env.DB_NAME);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_HOST);
if(useCloud){
    sequelize=new Sequelize(process.env.CL_DB_NAME, process.env.CL_DB_USER, process.env.CL_DB_PASSWORD, {
        host:process.env.CL_DB_HOST,
        dialect:'mysql',
    });
}else{
    sequelize=new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host:process.env.DB_HOST,
        dialect:'mysql',
    });
}

module.exports= sequelize;