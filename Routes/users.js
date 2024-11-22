//ALL ENDPOINTS CHECKED FOR, UNIT TEST READY, EXCEPT FOR GET USER
//*PAGE CONFIGURATION NEEDED FOR PASSWORD RESET
const express = require('express');
const router = express.Router();
const User = require('../Schemas/UserSchema'); //user model
const {Op} = require('sequelize'); //operator from sequelize module
const bcrypt = require('bcrypt'); //for password hashing
const saltRounds=10; //how many times password gets hashed
const jwt = require('jsonwebtoken'); //incorporate json webtokens for authentication
const jwtKey = 'EnestaVidaquieroTriunfaryHaceraDiosorgullosoDemi'; //jwt key
const {genToken} = require('../Routes_help/verification'); //generate verification tokens
const {sendVemail} = require('../Routes_help/v_email'); //send verification email
const {sendPchange} = require('../Routes_help/password_change'); //send password change option
const {verifyToken} = require ('../Routes_help/jwt'); //create helper function `for jwts

//CHEKED for 401, 402, 400, 200
router.post('/login', async(req, res)=>{

    try{
        const {username, password} = req.body; //username and password required input
        
        //check if username exists
        const user = await User.findOne({
            where: {username:username}
        });
        if(!user){
            return res.status(400).json({message: 'Invalid username Credentials'});
        }

        //check if password is a match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(401).json({message: 'Invalid Password'});
        }

        if (user.isVerified!=true){
            return res.status(402).json({message: 'email verification incomplete'});
        }

        //investigate purpose of json webtoken CHECK
        const token = jwt.sign({id: user.id}, jwtKey, {expiresIn: '1h'});

        //return token and message
        res.status(200).json({token, userId: user.id, message: 'Logged in successfully'});

    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Failed Login'})
    }
});

//CHECKED for 200, 400, functions work 
router.post('/register', async(req, res) => {

    try{
        const {username, password, email} = req.body; //username email password required

        //create email token
        const emailVtoken = genToken();

        //check if username or email already exists
        const existingUser = await User.findOne({ 
            where: {
                [Op.or]:[
                    {username},
                    {email}
                ]
            }
        });
        if (existingUser){
            return res.status(400).json({error: 'User already exists'});
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //create user
        const user = await User.create({
            username:username,
            password: hashedPassword,
            email:email, 
            emailVtoken: emailVtoken
        });

        //send verification email
        sendVemail(user.email, emailVtoken);

        //success message
        res.status(200).json({message: "account successfully created"});

    }catch(error){
        console.error(error);
        res.status(500).json({error: 'account creation failed', error});
    }
});


router.get('/user-info/:id', verifyToken, async(req, res)=>{

    try{
        const {id} = req.params;
        
        const user = await User.findOne({where: {id:id}});
        if(!user){
            return res.status(400).json({message: 'user not found'});
        }

        res.status(200).json(user);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//CHECKED for 200, 400
router.post('/resetPasswordEmail', async(req, res)=>{
    try{
        const {email} = req.body; //email required as input

        //check if email is in system
        const user = await User.findOne({
            where: {email:email}
        });
        if (!user){
            return res.status(400).json({message: 'no email matching to any user'});
        }

        //generate password reset token
        const passwordT = genToken();

        //assign password token for verification
        user.passwordVtoken=passwordT;
        await user.save();

        //send password change email
        sendPchange(user.email, passwordT);

        res.status(200).json({message: 'success'});
    }catch(error){
        res.status(500).send(error);
    }
});

//CHECKED for 400, 200, given success here, move to reset password page
router.post('/enterResetCode', async(req, res)=>{
    try{
        const {code} = req.body; //code required for input

        //check if token valid in database
        const user = await User.findOne({
            where:{passwordVtoken:code}
        });
        if(!user){
            return res.status(400).json({message: 'code incorrect or no matching code found'});
        }

        //remove token from user arsenal
        user.passwordVtoken = null;
        await user.save();

        res.status(200).json({message: 'success'});
    }catch(error){
        res.status(500).send(error)
    }   
});

//CHECKED for 200, 402, 401, 400
router.post('/changePassword', async(req, res) =>{

    try{
        const {username, newPassword, confirmPassword} = req.body; //username, new password and confirm new password

        //check if username is valid
        const user = await User.findOne({
            where: {username:username}
        });
        if (!user){
            return res.status(400).json({message: 'incorrect username'});
        }

        //check if new password matches copy
        if (newPassword!=confirmPassword){
            return res.status(401).json({message: 'passwords do not match'});
        }

        //check if password is repeated
        const isMatch = await bcrypt.compare(confirmPassword, user.password);
        if (isMatch){
            return res.status(402).json({message: 'new password cannot match old password'});
        }

        //hash password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        //change user password
        user.password=hashedPassword;
        await user.save();

        res.status(200).json({message:'success'});
    }catch(error){
        res.status(500).send(error);
    }
});

//CHECKED for 200, 400
router.post('/verifyEmail', async(req, res) => {
    
    try{
        const {emailVtoken} = req.body; //email verification token needed

        //check if email token is in system
        const user = await User.findOne({
            where: {emailVtoken:emailVtoken}
        });
        if(!user){
            return res.status(400).json({message:'incorrect token'});
        }

        //verify user, remove token
        user.isVerified=true;
        user.emailVtoken=null;
        await user.save();

        res.status(200).json({message:'success'});
    }catch(error){
        res.status(500).send(error);
    }
});


//CHECKED for 
router.post('/deleteAccount', verifyToken, async(req, res)=>{
    try{
        const {username, password} = req.body;

        const user = await User.findOne({
            where: {username:username, password:password}
        });
        if(!user){
            return res.status(400).json({message: 'incorrect credentials'});
        }

        await user.destroy();

        res.status(200).json({message:"success"});
    }catch(error){
        res.status(500).send(error);
    }
});

module.exports = router;