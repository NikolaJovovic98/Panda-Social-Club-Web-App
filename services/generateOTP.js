module.exports = ()=>{
    return new Promise((resolve,reject)=>{
        try {
            const val = Math.floor(1000 + Math.random() * 9000);
            resolve(val);
        } catch (error) {
            console.log(error);
            reject(false);
        }
    });
};