const otherUsersList = document.getElementById('other-users');
const loggedUser = document.getElementById('logged-user');
const msgSent = document.getElementById('msg-sent');
const sendMsgBtn = document.getElementById('send-msg-btn');
const chat = document.getElementById('chat');

window.addEventListener('DOMContentLoaded', (event) => {
    event.preventDefault();
    loadUsers();
    loadMessages();
});

async function loadUsers() {
    const response = await axios.get('http://localhost:3000/chat/online-users', {
        headers: {
            Authorization: localStorage.getItem('token')
        }
    });
    loggedUser.innerText = `${response.data.loggedUser.name}`;
    const otherUsers = response.data.otherUsers;
    for (let user of otherUsers) {
        const otherUser = `<li>${user.name}</li>`;
        otherUsersList.innerHTML += otherUser;
    }
}

function loadMessages() {
    // Getting the latest 10 messages from the local storage
    let oldMessages = [];
    let lastMsgId = 0;
    if (localStorage.getItem('msgs')) {
        oldMessages = JSON.parse(localStorage.getItem('msgs'));
        lastMsgId = oldMessages[oldMessages.length - 1].dataValues.id;
    }
    // Calling backend for new messages
    setInterval(async () => {
        const response = await axios.get(`http://localhost:3000/chat/get-msgs?lastMsgId=${lastMsgId}`, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });
        const newMessages = response.data.messages;
        const messages = [...oldMessages, ...newMessages];
        // Displaying chat (latest 10 messages from local storage + new messages from backend) on screen
        chat.innerHTML = '';
        for (let message of messages) {
            const chatItem = `
            <li>
                <p id="msg-by">${message.by}</p>
                <div>
                    <p>${message.dataValues.msg}</p>
                </div>    
                <p id="msg-time">${message.dataValues.date} (${twelveHourClock(message.dataValues.time)})</p>
            </li>`;
            chat.innerHTML += chatItem;
        }
        // Storing the latest 10 messages in the local storage
        const numOfMsgs = messages.length;
        const latestTenMsgs = [];
        for (let i = numOfMsgs - 10; i <= numOfMsgs - 1; i++) {
            latestTenMsgs.push(messages[i]);
        }
        localStorage.setItem('msgs', JSON.stringify(latestTenMsgs));
        // Scrolling down to the latest chat
        const chatContainer = document.getElementById('chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000);
}

function twelveHourClock(time) {
    const splittedTime = time.split(':');
    const AMorPM = splittedTime[0] >= 12 ? 'PM' : 'AM';
    const hour = splittedTime[0] % 12 || 12;
    return `${hour} : ${splittedTime[1]} ${AMorPM}`;
}

sendMsgBtn.addEventListener('click', sendMessage);

async function sendMessage(event) {
    event.preventDefault();
    if (msgSent.value === '') {
        showMsgNotification('Please enter a message.');
    } else {
        const response = await axios.post('http://localhost:3000/chat/add-msg', { msgSent: msgSent.value }, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });
        showMsgNotification(response.data.message);
        // Clearing the message field
        msgSent.value = '';
    }
}

function showMsgNotification(message) {
    const notificationDiv = document.getElementById('msg-notification');
    notificationDiv.innerHTML = `${message}`;
    notificationDiv.style.display = 'flex';
    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 1000);
};