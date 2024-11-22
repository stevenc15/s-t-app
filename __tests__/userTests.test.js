const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
//const VideoRoutes = require('../Routes/video');
const UserRoutes = require('../Routes/users');

const app = require('../server.js');
const User = require('../Schemas/UserSchema');
//const Video = require('../Schemas/VideoSchema');
//const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken'); 
//const verifyToken=require('../Routes_help/jwt');

app.use(express.json());
app.use('/', UserRoutes);

const { Op } = require('sequelize');

jest.mock('../Routes_help/jwt', ()=> ({
    verifyToken: jest.fn((req, res, next)=>{
        req.user = {id:'mockUserId'};
        next();
    }),
}));


jest.mock('../Schemas/UserSchema', ()=>({

    findOne:jest.fn((data) => {
        console.log('data shape', data);
        // Check if `data.where` includes `Op.or` conditions
        // Retrieve the `Symbol(or)` key dynamically
        const symbolOrKey = Object.getOwnPropertySymbols(data.where).find(
            (sym) => sym.toString() === 'Symbol(or)'
        );

        if (symbolOrKey) {
            const orConditions = data.where[symbolOrKey];
            if (orConditions.some(condition => 
                condition.username === 'someGuy17' || 
                condition.email === 'someemail@gmail.com'
            )) {
                return Promise.resolve({
                    id: 2,
                    username: 'someGuy17',
                    password: 'somePass',
                    email: 'someemail@gmail.com',
                    isVerified: true,
                    emailVtoken: 'mockEtoken',
                    passwordVtoken: 'mockPtoken', 
                    save: jest.fn().mockResolvedValue(true)
                });
            }
        }
        
        if ((data.where.username === 'someGuy17') || 
            (data.where.emailVtoken === 'mockEtoken') || 
            (data.where.passwordVtoken === 'mockPtoken') || 
            (data.where.email === 'someemail@gmail.com') || 
            (data.where.password==='somePass') ||
            (data.where.id==='2')
        ) {
            return Promise.resolve({
                id: 2,
                username: 'someGuy17',
                password: 'somePass',
                email: 'someemail@gmail.com',
                isVerified: true,
                emailVtoken: 'mockEtoken',
                passwordVtoken: 'mockPtoken', 
                save: jest.fn().mockResolvedValue(true),
                destroy: jest.fn()
            });
        }
        
        if (data.where.username === 'someGuy2') {
            return Promise.resolve({
                id: 3,
                username: 'someGuy2',
                password: 'somePass4',
                email: 'someemail2@gmail.com',
                isVerified: false, 
                emailVtoken: 'mockEtoken',
                save: jest.fn().mockResolvedValue(true)
            });
        }

        return Promise.resolve(null);
    }),       
    findByPk: jest.fn(),
    hasMany: jest.fn(),
    //save: jest.fn(),
    create: jest.fn((data)=> Promise.resolve({
        username:data.username,
        email: data.email,
        password: data.password
    }))
}));

jest.mock('bcrypt', ()=>({
    compare: jest.fn(),
    hash: jest.fn()
}));

jest.mock('../Schemas/VideoSchema', ()=>({

        findOne: jest.fn(),       
        findByPk: jest.fn(),
        belongsTo: jest.fn(),
        //create: jest.requireActual('../Schemas/VideoSchema').create,
        //destroy: jest.requireActual('../Schemas/VideoSchema').destroy
}));

// Start the server before tests and stop it after tests
let server;

beforeAll(() => {
  server = app.listen(5002, () => {
    console.log('Server running on port 5002');
  });
});

afterAll(() => {
  server.close();
});


//###########################################################
//LOGIN
describe('POST /login', ()=>{

    it('should log in user, 200 code', async () => {
        bcrypt.compare.mockResolvedValue(true);

        const response = await request(app)
            .post('/users/login')
            .send({
                "username": "someGuy17",
                "password": "somePass"
            });

            console.log(response.body);
        
        expect(response.statusCode).toBe(200);
    });

    it('should fail to log in user b/c of username, 400 code', async () =>{

        bcrypt.compare.mockResolvedValue(true);

        const response = await request(app)
            .post('/users/login')
            .send({
                "username": "someGuy27",
                "password": "somePass"
            });

            console.log(response.body);

        expect(response.statusCode).toBe(400);
    });

    it('should fail to log in, mismatch password, 401 code', async () => {
        bcrypt.compare.mockResolvedValue(false);

        const response = await request(app)
            .post('/users/login')
            .send({
                "username": "someGuy17",
                "password": "somePass5"
            });

            console.log(response.body);
        
        expect(response.statusCode).toBe(401);
    });

    it('should fail to log in b/c emailV, 402 code', async () => {

        bcrypt.compare.mockResolvedValue(true);

        const response = await request(app)
            .post('/users/login')
            .send({
                "username": "someGuy2",
                "password": "somePass2"
            });

            console.log(response.body);
        
        expect(response.statusCode).toBe(402);
    });

});


//###########################################################
//REGISTER
describe('POST /register', ()=>{

    it('should register user, 200 code', async () => {
        
        const RandomN = Math.floor(Math.random() * 10000);
        console.log('Generated random number:', RandomN);
        const response = await request(app)
            .post('/users/register')
            .send({
                "username": `User${RandomN}`,
                "password": 'Fedevalverde15*',
                "email": `user${RandomN}@gmail.com`
            });

            console.log(response.body);
        
        expect(response.statusCode).toBe(200);
    });

    it('should fail to register user b/c of username/email, 400 code', async () =>{

        const response = await request(app)
            .post('/users/register')
            .send({
                    "username": 'someGuy17',
                    "password": 'somePass',
                    "email": 'someemail@gmail.com'
                });

            console.log(response.body);

        expect(response.statusCode).toBe(400);
    });
 
});


//###########################################################
//RESET PASSWORD EMAIL
describe('POST /resetPasswordEmail', ()=>{

    it('it should send reset password email, 200 code', async ()=>{

        const response = await request(app)
            .post('/users/resetPasswordEmail')
            .send({"email":'someemail@gmail.com'});

            console.log(response.body);
        
            expect(response.statusCode).toBe(200);
    });

    it('it should fail to send reset password email, 400 code', async ()=>{

        const response = await request(app)
            .post('/users/resetPasswordEmail')
            .send({"email":'doesntexist@email.com'});

            console.log(response.body);
        
            expect(response.statusCode).toBe(400);
    });

});


//###########################################################
//ENTER RESET CODE
describe('POST /enterResetCode', ()=>{

    it('it should accept matching password reset code, 200 code', async()=>{

        const response = await request(app)
            .post('/users/enterResetCode')
            .send({"code": 'mockPtoken'})

            console.log(response.body);

        expect(response.statusCode).toBe(200);
    });

    it('it should reject entered p reset code, 400 code', async()=>{

        const response = await request(app)
            .post('/users/enterResetCode')
            .send({"code": 'soybeans'})
            
            console.log(response.body);
        
        expect(response.statusCode).toBe(400);
    });

});


//###########################################################
//CHANGE PASSWORD
describe('POST /changePassword', ()=>{

    it('it should accept password change, 200 code', async()=>{
        
        bcrypt.compare.mockResolvedValue(false);
        bcrypt.hash.mockResolvedValue("hashedPassword");

        const response = await request(app)
            .post('/users/changePassword')
            .send({
                "username": 'someGuy17',
                "newPassword": 'patatasbravas',
                "confirmPassword": 'patatasbravas'
            });
            
            console.log(response.body);

        expect(response.statusCode).toBe(200);

    });

    it('it should reject password change b/c of username , 400 code', async()=>{

        bcrypt.compare.mockResolvedValue(false);
        bcrypt.hash.mockResolvedValue("hashedPassword");
        const response = await request(app)
            .post('/users/changePassword')
            .send({
                "username": 'someGuy15',
                "newPassword": 'patatasbravas',
                "confirmPassword": 'patatasbravas'
            });
            
            console.log(response.body);

        expect(response.statusCode).toBe(400);
    });

    it('it should reject password change b/c of password mismatch , 401 code', async()=>{

        bcrypt.compare.mockResolvedValue(false);
        bcrypt.hash.mockResolvedValue("hashedPassword");
        const response = await request(app)
            .post('/users/changePassword')
            .send({
                "username": 'someGuy17',
                "newPassword": 'patatasbravas',
                "confirmPassword": 'patatasbravas15'
            });
            
            console.log(response.body);

        expect(response.statusCode).toBe(401);
    });

    it('it should reject password change b/c of repeated password , 402 code', async()=>{

        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue("hashedPassword");
        const response = await request(app)
            .post('/users/changePassword')
            .send({
                "username": 'someGuy17',
                "newPassword": 'somePass',
                "confirmPassword": 'somePass'
            });
            
            console.log(response.body);

        expect(response.statusCode).toBe(402);
    });

});


//###########################################################
//VERIFY EMAIL
describe('POST /verifyEmail', ()=>{

    it('it should authenticate user, 200 code', async()=>{

        const response = await request(app)
            .post('/users/verifyEmail')
            .send({
                "emailVtoken": 'mockEtoken'
            })

            console.log(response.body);

        expect(response.statusCode).toBe(200);
    });

    it('it should fail to authenticate user, 400 code', async()=>{

        const response = await request(app)
            .post('/users/verifyEmail')
            .send({
                "emailVtoken": 'someToken5'
            })

            console.log(response.body);

        expect(response.statusCode).toBe(400);
    });

});


//###########################################################
//DELETE USER
describe('POST /deleteAccount', ()=>{
    it('it should delete user, 200 code', async()=>{

        const response = await request(app)
            .post('/users/deleteAccount')
            .send({
                "username": "someGuy17",
                "password": "somePass"
            })

            console.log(response.body);

        expect(response.statusCode).toBe(200);
    });

    it('it should delete user, 400 code', async()=>{

        const response = await request(app)
            .post('/users/deleteAccount')
            .send({
                "username": "someGuy27",
                "password": "somePass5"
            })

            console.log(response.body);

        expect(response.statusCode).toBe(400);
    });
});


//###########################################################
//GET USER
describe('GET /user-info/:id', ()=>{
    it('it should get user, 200 code', async()=>{

        const response = await request(app)
            .get('/user-info/2')
         

            console.log(response.body);

        expect(response.statusCode).toBe(200);
    });

    it('it should fail to get user, 400 code', async()=>{

        const response = await request(app)
            .get('/user-info/5')

            console.log(response.body);

        expect(response.statusCode).toBe(400);
    });
});
