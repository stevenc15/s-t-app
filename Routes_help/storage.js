const {Storage} = require('@google-cloud/storage');
const path = require('path');

const key_file_name = '../backend/cloud_database/stately-arbor-440515-i7-ee072992ff08.json'; //path.join(__dirname, '/Users/stevencamacho/Desktop/ML_Project_help/stately-arbor-440515-i7-ee072992ff08.json');
const storage = new Storage({keyFilename:key_file_name});
const Bucket_name = 'video_bucket_01';

const uploadGCS = async(local_file_path, destination) => {
    try{
        await storage.bucket(Bucket_name).upload(local_file_path, {
            destination,
            gzip: true,
            metadata:{
                cacheControl: 'public, max-age=31536000',
                contentType: 'video/mp4'
            },
        });
        console.log(`${local_file_path} uploaded to ${Bucket_name}/${destination}`);
    }catch(error){
        console.log(error);
    }
};

const generate_signed_url = async (filename) => {
    const options={
    version: 'v4', 
    action: "read",
    expires:Date.now()+24*60*60*1000
    };
    const [url] = await storage.bucket(Bucket_name).file(filename).getSignedUrl(options);
    return url;
}

module.exports={uploadGCS, generate_signed_url};
