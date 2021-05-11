
module.exports = (userId1,userId2)=>{
    return new Promise((resolve,reject)=>{
        try {
            let toNumberUserId1 = parseInt(userId1);
            let toNumberUserId2 = parseInt(userId2);
            if(toNumberUserId1 > toNumberUserId2){  
                let temp = toNumberUserId1; 
                toNumberUserId1 = toNumberUserId2;
                toNumberUserId2 = temp;
            }
            let userId1String = toNumberUserId1.toString();
            userId1String+="|";
            let userId2String = toNumberUserId2.toString();
            resolve(
                userId1String + userId2String
            );
        } catch (error) {
            console.log(error+" Error in creating room id");
            reject(false);
        }
    });
};