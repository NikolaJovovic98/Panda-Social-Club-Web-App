const sanitize = require("sanitize-html");

module.exports = {
    sanitize_message: (data)=>{
        return new Promise((resolve,reject)=>{
            try {
                resolve(
                    sanitize(data,{
                        allowedTags:['img'],
                        allowedAttributes: {
                            'img': [ 'src','width' ]
                        }
                    })
                );
            } catch (error) {
                console.log(error);
                reject(false);
            }
        });
    },
    sanitize_credentials: (data)=>{
        return new Promise((resolve,reject)=>{
            try {
                resolve(
                    sanitize(data)
                );
            } catch (error) {
                console.log(error);
                reject(false);
            }
        });
    }
}