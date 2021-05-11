const imageFolder = require("../app");
const sizeOf = require("image-size");

module.exports = (imageName)=>{
    return new Promise((resolve,reject)=>{
        const fullImagePath = imageFolder+"/images/"+imageName;
        try {
            sizeOf(fullImagePath, function (err, dimensions) {
                if(err){console.log(err);reject(false);}
                resolve(dimensions);
              });
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
}