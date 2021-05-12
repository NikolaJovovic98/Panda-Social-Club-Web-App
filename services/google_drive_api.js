const { google } = require("googleapis");
const fs = require("fs");

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID ,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET ,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
);

oAuth2Client.setCredentials({refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN});

const google_drive = google.drive({
    version:"v3",
    auth:oAuth2Client
});

const upload_to_google_drive = (image_name,image_mimetype,image_path)=>{
    return new Promise(async (resolve,reject)=>{
        try {
            // upload to google drive
            const upload  = await google_drive.files.create({
                requestBody:{
                    name:image_name,
                    mimeType:image_mimetype
                },
                media:{
                    mimeType:image_mimetype,
                    body:fs.createReadStream(image_path)
                }
            });
            const image_id = upload.data.id;
            // set to public 
            await google_drive.permissions.create({
                fileId:image_id,
                requestBody:{
                    role:"reader",
                    type:"anyone"
                }
            });
            // image url for html viewing
            const image_url = `https://drive.google.com/uc?id=${image_id}`
            const image_data = {
                id:upload.data.id,
                image_url
            }
            console.log("Image uploaded to google drive and set to public.");
            resolve(image_data);
        } catch (error) {
            console.log("Not able to upload to google drive: "+error);
            reject(false);
        }
    });
}

const delete_from_google_drive = (image_id)=>{
    return new Promise(async (resolve,reject)=>{
        const default_cover_photo_id = "1TLU1K1AozzF6hrooGULh6P_obL6C7MdQ";
        try {
            if(image_id !== default_cover_photo_id){
            await google_drive.files.delete({
                fileId:image_id
            });
            }else{
                return resolve(true);
            }
            console.log("Image deleted from google drive");
            resolve(true);
        } catch (error) {
            console.log("Not able to remove image from google drive: "+error);
            reject(false);
        }
    });
}

module.exports = {
    upload_to_google_drive,
    delete_from_google_drive
}