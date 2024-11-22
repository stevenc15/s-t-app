const { exec } = require('child_process');

const convertToH264=(inputPath, outputPath)=>{
    return new Promise((resolve, reject) => {
        const command = `ffmpeg -i ${inputPath} -c:v libx264 -preset fast -crf 23 -c:a aac ${outputPath}`;

        exec( command, (error, stdout, stderr)=>{
            if (error){
                console.error('error converting video', error);
                reject(error);
            }else{
                console.log('video successfully converted');
                resolve(outputPath);
            }
        });
    });
};


module.exports = {convertToH264};