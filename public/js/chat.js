//Dom query
const userId = document.getElementById('logged-user-data').dataset.userid; // navbar
//Public
const publicChatForm = document.getElementById('formPublicChat');
const userFirstName = document.getElementById('inputName');
const userMessage = document.getElementById('inputMessage');
const messagesPanel = document.getElementById('messages');
const messagesDiv = document.getElementById('messages-div');
const isTypingMessage = document.getElementById('isTypingMessage');

if (userId) {
    //Make connection
    const socket = io();

    //Emmit events
    publicChatForm.addEventListener('submit', (e) => {
        const message = userMessage.value;
        const user = userFirstName.value;
        e.preventDefault();
        if (checkMessage(message)) {
            socket.emit('public-chat', {
                user,
                message
            });
            emptyMessage(userMessage);
        } else {
            alert("Message must be filled");
        }
    });

    userMessage.addEventListener('keypress', (e) => {
        const user = userFirstName.value;
        socket.emit('typing', { user });
    });

    userMessage.addEventListener('focusout', (e) => {
        socket.emit('stop-typing');
    });

    //Listen for events
    socket.on('public-chat', (data) => {
        isTypingMessage.innerHTML = 'Chat';
        //data.message = sanitizeHTML(data.message);
        const li = document.createElement('li');
        if (data.user === userFirstName.value) {
            li.innerHTML = `<span style="color:green"><strong>${data.user}:</strong> ${data.message}</span>`;
        } else {
            li.innerHTML = `<span><strong>${data.user}:</strong> ${data.message}</span>`;
        }
        messagesPanel.appendChild(li);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    socket.on('typing', (data) => {
        isTypingMessage.textContent = `${data.user} is typing a message...`;
    });

    socket.on('stop-typing', () => {
        isTypingMessage.textContent = `Chat`;
    });

}

function checkMessage(message) {
    if (message.length === 0) { return false; }
    return true;
}

function emptyMessage(message) {
    message.value = '';
}

var sanitizeHTML = function (str) {
    return str.replace(/[^\w. ]/gi, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
};