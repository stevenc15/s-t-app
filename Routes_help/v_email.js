const nodemailer = require('nodemailer');

const sender = nodemailer.createTransport({
    service: 'Gmail',
    auth: {

        user: 'soccertrackerapp@gmail.com',
        pass: 'nizp jmvw klhd fbxv',
    },
});

const sendVemail = (recipient_email, v_token)=>{
    
    const maildraft={
        from: 'soccertrackerapp@gmail.com',
        to: recipient_email,
        subject: 'Account Verification Email',
        text: 'Please use the following code to verify your account: ' + v_token,
    };
    
    sender.sendMail(maildraft, (error)=>{
        if (error){
            console.error('v email failed', error);
        }else{
            console.log('verification email sent');
        }

    });


};

const send_completion_email = (recipient_email)=>{
    
    const maildraft={
        from: 'soccertrackerapp@gmail.com',
        to: recipient_email,
        subject: 'Video Processing Complete!',
        text: 'Go to web page to check your processed video!',
    };
    
    sender.sendMail(maildraft, (error)=>{
        if (error){
            console.error('v email failed', error);
        }else{
            console.log('verification email sent');
        }

    });


};
module.exports = {sender, sendVemail, send_completion_email};