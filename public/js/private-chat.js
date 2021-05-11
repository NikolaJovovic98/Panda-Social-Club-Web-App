const socket = io();

const privateChatForm = document.getElementById("privateChatForm");
const privateChatAvatarField = document.querySelectorAll(".private-chat-avatar");

const userWhoIsSendingMessageName = document.getElementById("inputNamePrivate");
const userWhoIsSendingMessageEmail = document.getElementById("inputNamePrivate");
const userWhoIsReceivingMessageName = document.getElementById("chatWithUserName");
const userWhoIsReceivingMessageEmail = document.getElementById("chatWithUserEmail");
const userWhoIsReceivingMessageId = document.getElementById("chatWithUserId");

const privateMessage = document.getElementById("inputMessagePrivate");
const privateMessagesPanel = document.getElementById('messagesPrivate');
const privateMessagesDiv = document.getElementById('messages-div-private');

const isTypingMessagePrivate = document.getElementById("isTypingMessagePrivate");

Array.from(privateChatAvatarField).forEach(field => {
    field.addEventListener("click", async (e) => {
        let receiverId = e.currentTarget.dataset.privatechatavatarid;
        let senderId = userId;
        let roomId = await createRoomId(receiverId,senderId);
        // alert("Created room with id: " + roomId);
        socket.emit('joinRoom', { roomId });
    });
});

privateChatForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    const message = privateMessage.value;
    const senderName = userWhoIsSendingMessageName.value;
    const senderId = userId;
    const receiverId = userWhoIsReceivingMessageId.value;
    let roomId = await createRoomId(receiverId,senderId);
    if (checkMessage(message)) {
        socket.emit('private-chat', {
            roomId,
            message,
            senderName
        });
        emptyMessage(privateMessage);
    } else {
        alert("Message must be filled");
    }
});

socket.on('private-chat', (data) => {
    let roomId = privateMessagesPanel.dataset.roomid;
    if (roomId === data.roomId) {
        const li = document.createElement('li');
        if (data.senderName === userWhoIsSendingMessageName.value) {
            li.innerHTML = `<span style="color:green"><strong>${data.senderName}:</strong> ${data.message}</span>`;
        } else {
            li.innerHTML = `<span><strong>${data.senderName}:</strong> ${data.message}</span>`;
        }
        privateMessagesPanel.appendChild(li);
        privateMessagesDiv.scrollTop = privateMessagesDiv.scrollHeight;
    }
});


function checkMessage(message) {
    if (message.length === 0) { return false; }
    return true;
}

function emptyMessage(message) {
    message.value = '';
}

function createRoomId(userId1,userId2){
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