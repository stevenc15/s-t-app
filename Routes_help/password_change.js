const nodemailer = require('nodemailer');

const sender = nodemailer.createTransport({
    service: 'Gmail',
    auth:{

        user: 'soccertrackerapp@gmail.com',
        pass: 'nizp jmvw klhd fbxv',
    },
});

const sendPchange = (recipient_email, p_token) =>{

    const maildraft = {
        from: 'soccertrackerapp@gmail.com',
        to: recipient_email,
        subject: 'Password change email',
        text: 'Please use the following code to continue to password verification: ' +  p_token
    }; 

    sender.sendMail(maildraft, (error) => {
        if (error){
            console.error('password token email not sent', error);
        }else{
            console.log('password token email sent');
        }
    });
};

module.exports = {sender, sendPchange};