const {v4: uuidv4} = require('uuid');

const genToken = () =>{
    const emailToken = uuidv4();
    return emailToken;
}

module.exports = {genToken};