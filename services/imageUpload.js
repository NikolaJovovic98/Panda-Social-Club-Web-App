const imageFolder = require("../app");

module.exports = (image) => {
    return new Promise((resolve, reject) => {
        try {
            const avatarImage = image;
            const avatarName = avatarImage.name;
            const uploadpath = imageFolder + "/images/" + avatarName;
            avatarImage.mv(uploadpath, (err) => {
                if (err) { console.log("Image upload failed", avatarName, err); }
                else {
                    console.log("Image uploaded to express server", avatarName);
                }
            });
            resolve(true);
        } catch (error) {
            console.log("Image uploader promise rejection: "+error);
            reject(false);
        }
    });
}


