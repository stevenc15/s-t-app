const request = require('supertest');
const express = require('express');
const app = require('../server.js');
const VideoRoutes = require('../Routes/video');
const Video = require('../Schemas/VideoSchema');

const jwt = require('jsonwebtoken'); 
const verifyToken=require('../Routes_help/jwt');

app.use(express.json());
app.use('/', VideoRoutes);
const path = require('path');
const {Op, belongsTo} = require('sequelize');
const multer = require('multer');
const { uploadGCS, generate_signed_url } = require('../Routes_help/storage.js');
const { processVideo } = require('../Routes_help/videoProcessor.js');
const { convertToH264 } = require('../Routes_help/convert_video.js');

//verifyToken parece ser el problema
jest.mock('../Routes_help/jwt', ()=> ({
    verifyToken: jest.fn((req, res, next)=>{
        req.user = {id:'mockUserId'};
        next();
    }),
}));

jest.mock('../Routes_help/videoProcessor', ()=>({
    
    processVideo: jest.fn()
}))
jest.mock('../Routes_help/storage', ()=>({
    uploadGCS: jest.fn(),
    generate_signed_url: jest.fn()
}));
jest.mock('../Schemas/UserSchema', ()=>({

        findOne: jest.fn(),       
        findByPk: jest.fn(),
        hasMany: jest.fn() 
}));

jest.mock('../Routes_help/convert_video', ()=>({
    convertToH264: jest.fn()
}));

jest.mock('../Schemas/VideoSchema', ()=>({

        findOne: jest.fn((data)=>{
            console.log('data shape', data);
            const symbolLikeKey = Object.getOwnPropertySymbols(data.where.video_name).find(
                
                (sym) => sym.toString()=== 'Symbol(like)'
            );

            if ( symbolLikeKey){
                const LikeConditions = data.where.video_name[symbolLikeKey];
                if ((LikeConditions==='%videoName%') && 
                    data.where.userId === '2'
                ){

                    return Promise.resolve({
                        id: 2,
                        userId: "2",
                        Url: "something",
                        video_name: "videoName", 
                        destroy: jest.fn()
                    });
                }
                } 
            if (data.where.userId==='1' && data.where.video_name==='someVideo1'){
                return Promise.resolve({
                    id: 1,
                    userId: "1",
                    Url: "something",
                    video_name: "someVideo1"
                });
            }
            
            return Promise.resolve(null);
        }),       
        findByPk: jest.fn(),
        find: jest.fn((data)=>{
            if (data.where.userId==='1'){
                return Promise.resolve({
                    id: 1,
                    userId: "1",
                    Url: "something",
                    video_name: "someVideo1"
                });
            }
        }),
        belongsTo: jest.fn(),
        create: jest.fn((data)=> Promise.resolve({
            userId:data.userId,
            Url: data.Url,
            video_name: data.video_name
        })),
}));

jest.mock('multer', () => {
    return jest.fn(()=>({
        single: jest.fn(()=>(req, res, next)=>{
            req.file={path: 'mocked/path/to/video.mp4', filename:'mocked_video'};
            next();
        }),
    }))
});


// Start the server before tests and stop it after tests
let server;

beforeAll(() => {
  server = app.listen(5003, () => {
    console.log('Server running on port 5003');
  });
});

afterAll(() => {
  server.close();
});

//find how to test success case

describe('POST /process_video', ()=>{

    //200
    it('it should accept video and process successfully, 200 code', async()=>{
        console.log('process video', processVideo);
        processVideo.mockResolvedValue();

        convertToH264.mockResolvedValue();

        const videoPath = path.join(__dirname, '08fd33_4copy.mp4');
       
        const process = await request(app)
            .post('/video/process_video')
            .attach('video', videoPath)

            console.log(process.body);
        
        expect(process.statusCode).toBe(200);

    });

});

describe('POST /save_video', ()=>{

    //200
    it('it should successfully save the video, 200 code', async()=>{      
        
        uploadGCS.mockResolvedValue();
        generate_signed_url.mockResolvedValue('mockUrl');
        const process = await request(app)

            .post('/video/save_video')
            .send({
                "userId": "2",
                "filepath": "something",
                "video_name": "someVideo2"
            });

            console.log(process.body);

        expect(process.statusCode).toBe(200)
    });

    //400
    it('it should fail to save a video b/c video is saved already, 400 code', async()=>{

        const process = await request(app)
            .post('/video/save_video')
            .send({
                "userId": "1",
                "filepath": "something",
                "video_name": "someVideo1"
            });

            console.log(process.body);

        expect(process.statusCode).toBe(400)

    });

});

describe('POST /delete_video', ()=>{

    //200
    it('it should delete the video successfully, 200 code', async()=>{
        const process = await request(app)

            .post('/video/delete_video')
            .send({
                "userId":"2",
                "video_name":"videoName"
            });

            console.log(process.body);

        expect(process.statusCode).toBe(200)
    });

    //401
    it('it should fail to delete video b/c of name, 401 code', async()=>{
        const process = await request(app)

            .post('/video/delete_video')
            .send({
                "userId":"2",
                "video_name":"Videocaca"
            });

            console.log(process.body);

        expect(process.statusCode).toBe(401)

    });

});

describe('POST /search_video', ()=>{
    
    //200
    it('it should search the video successfully, 200 code', async()=>{
        const process = await request(app)
            .post('/video/search_video')
            .send({
                "userId": "2",
                "video_name": "videoName"
            });

            console.log(process.body);
        
        expect(process.statusCode).toBe(200);
    });

    //400
    it('it should fail to search video b/c of name, 400 code', async()=>{
        const process = await request(app)

            .post('/video/search_video')
            .send({
                "userId":"2",
                "video_name":"Videocaca"
            });

            console.log(process.body);

        expect(process.statusCode).toBe(400);

    });

});


describe('GET /saved-videos/:userId', ()=>{

    it('it should return saved videos from user, 200 code', async()=>{
        const process = await request(app)
            .get('/saved-videos/1')

            console.log(process.body);

        

        expect(process.statusCode).toBe(200);

    });
});
