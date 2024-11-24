//ALL of backend done in terms of functionality and postman testing, 
//minor additions could be made, unit test ready
const express = require('express'); // Import the Express framework to create a server and handle HTTP requests
const app = express();
const cors = require('cors');
const path = require('path');
require('./Schemas/associations');


const sequelize = require('./database/database');

//connect to database
sequelize.authenticate()
    .then(() => console.log("database connected"))
    .catch((err) => console.error("error in connecting to database:", err));

//initialize database tables
async function InitializeDatabase(){
    try{
        await sequelize.sync ({force:false});
        console.log("database tables created");
    }catch(error){
        console.error('failed to create table', error);
    }
}

InitializeDatabase();

// Define CORS options for cross port communication
const corsOptions = {
    origin: 'http://localhost:3001', // Replace with your frontend’s address
    methods: 'GET,POST'              // Specify the allowed HTTP methods
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/outputs', (req, res, next) => {
    res.setHeader('Content-Disposition', 'attachment');
    next();
  });

// Make files from the 'outputs' directory static
app.use('/outputs', express.static(path.join(__dirname, 'Routes', 'outputs')));

//make video endpoints available for use by server
const videoRouter = require('./Routes/video');
app.use('/video', videoRouter);

//make user endpoints available for use by server
const userRouter = require('./Routes/users');
app.use('/users', userRouter);

//define port
const PORT = 5001;

//have server run on defined port
if (process.env.NODE_ENV!=='test'){
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
})};

module.exports=app;
