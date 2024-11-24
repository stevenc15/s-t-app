const jwt = require('jsonwebtoken');
const jwtKey = 'EnestaVidaquieroTriunfaryHaceraDiosorgullosoDemi'; //jwt key

const verifyToken = (req, res, next ) => { //middleware to allow user to proceed with using/calling the endpoint
    //console.log('Request headers:', req.headers);
    const token = req.headers['authorization']; //grab token from Authorization header

    console.log('Authorization header:', token); 
//{/*&& token.startsWith('Bearer ')*/}
    if(token && token.startsWith('Bearer ')){ //if token present
        console.log('token present');
        const actualToken = token.split(' ')[1];

        //verify token, jwtkey
        jwt.verify(actualToken, jwtKey, (err, decoded) => {
            if (err){ //token expired or unauthorized
                return res.status(400).json({error:'Unauthorized access: Invalid token'});
            }
            req.user=decoded; //decoded added to req to allow endpoints to access user info
            next(); //proceed
        });
    }else{ //no token
        res.status(401).json({error: 'A token is required for authentication'});
    }
};

module.exports = verifyToken;
