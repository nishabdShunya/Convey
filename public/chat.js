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

async function loadMessages() {
    setInterval(async () => {
        const response = await axios.get('http://localhost:3000/chat/get-msgs', {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });
        const messages = response.data.messages;
        chat.innerHTML = '';
        for (let message of messages) {
            const time = message.dataValues.time;
            const splittedTime = time.split(':');
            const AMorPM = splittedTime[0] >= 12 ? 'PM' : 'AM';
            const hour = splittedTime[0] % 12 || 12;
            const finalTime = `${hour} : ${splittedTime[1]} ${AMorPM}`;
            const chatItem = `
            <li>
                <p id="msg-by">${message.by}</p>
                <div>
                    <p>${message.dataValues.msg}</p>
                </div>    
                <p id="msg-time">${message.dataValues.date} (${finalTime})</p>
            </li>`;
            chat.innerHTML += chatItem;
        }
        const chatContainer = document.getElementById('chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000)
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
    // chat.style.marginBottom = '0';
    setTimeout(() => {
        notificationDiv.style.display = 'none';
        // chat.style.marginBottom = '5rem';
    }, 1000);
};