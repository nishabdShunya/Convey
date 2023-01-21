const membersList = document.getElementById('group-users');
const groupImg = document.getElementById('group-img');
const groupName = document.getElementById('group-name');
const groupAdmin = document.getElementById('group-admin');
const msgSent = document.getElementById('msg-sent');
const sendMsgBtn = document.getElementById('send-msg-btn');
const chat = document.getElementById('chat');
const closeGroupBtn = document.getElementById('close-group-btn');

window.addEventListener('DOMContentLoaded', (event) => {
    event.preventDefault();
    loadMembers();
    loadGroupMessages();
});

async function loadMembers() {
    try {
        const chatGroup = localStorage.getItem('groupName');
        const response = await axios.get(`http://localhost:3000/groupChat/members?chatGroup=${chatGroup}`, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });
        if (response.status === 200) {
            groupImg.src = response.data.groupInfo.group_pic.replace('public\\', '');
            groupName.innerText = `${response.data.groupInfo.name}`;
            groupAdmin.innerText = `Admin (Creator) : ${response.data.groupInfo.admin}`;
            const members = response.data.members;
            for (let member of members) {
                let groupMember = `<li><img src="${member.profile_pic.replace('public\\', '')}">${member.name}</li>`;
                if (member.id === response.data.loggedUser.id) {
                    groupMember = `<li><img src="${member.profile_pic.replace('public\\', '')}">${member.name}<span>YOU</span></li>`;
                }
                membersList.innerHTML += groupMember;
            }
        } else {
            showNotification('Something went wrong. Please try again.');
        }
    } catch (error) {
        showNotification(error.response.data.message);
    }
};

async function loadGroupMessages() {
    try {
        // Getting the latest 10 messages from the local storage
        let oldMessages = [];
        let lastMsgId = 0;
        if (localStorage.getItem('groupMsgs')) {
            if (JSON.parse(localStorage.getItem('groupMsgs')).length !== 0) {
                oldMessages = JSON.parse(localStorage.getItem('groupMsgs'));
                lastMsgId = oldMessages[oldMessages.length - 1].dataValues.id;
            }
        }
        // Calling backend for new messages
        const chatGroup = localStorage.getItem('groupName');
        const response = await axios.get(`http://localhost:3000/groupChat/get-msgs/${chatGroup}?lastMsgId=${lastMsgId}`, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });
        if (response.status === 200) {
            const newMessages = response.data.messages;
            let messages = newMessages;
            if (oldMessages.length > 0) {
                messages = [...oldMessages, ...newMessages];
            }
            // Displaying chat (latest 10 messages from local storage + new messages from backend) on screen
            displayMessages(messages);
            // Storing the latest 10 messages in the local storage
            const numOfMsgs = messages.length;
            const latestTenMsgs = [];
            if (numOfMsgs < 10) {
                for (let i = 0; i < numOfMsgs; i++) {
                    latestTenMsgs.push(messages[i]);
                }
            } else {
                for (let i = numOfMsgs - 10; i < numOfMsgs; i++) {
                    latestTenMsgs.push(messages[i]);
                }
            }
            localStorage.setItem('groupMsgs', JSON.stringify(latestTenMsgs));
            // Scrolling down to the latest chat
            const chatContainer = document.getElementById('chat-container');
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            showNotification('Something went wrong. Please try again.');
        }
    } catch (error) {
        showNotification(error.response.data.message);
    }
}

function displayMessages(messages) {
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
};

function twelveHourClock(time) {
    const splittedTime = time.split(':');
    const AMorPM = splittedTime[0] >= 12 ? 'PM' : 'AM';
    const hour = splittedTime[0] % 12 || 12;
    return `${hour} : ${splittedTime[1]} ${AMorPM}`;
};

sendMsgBtn.addEventListener('click', sendMessage);

async function sendMessage(event) {
    event.preventDefault();
    try {
        if (msgSent.value === '') {
            showMsgNotification('Please enter a message.');
        } else {
            const chatGroup = localStorage.getItem('groupName');
            const response = await axios.post(`http://localhost:3000/groupChat/add-msg?chatGroup=${chatGroup}`, { msgSent: msgSent.value }, {
                headers: {
                    Authorization: localStorage.getItem('token')
                }
            });
            if (response.status === 201) {
                showMsgNotification(response.data.message);
                loadGroupMessages();
                // Clearing the message field
                msgSent.value = '';
            } else {
                showNotification('Something went wrong. Please try again.');
            }
        }
    } catch (error) {
        showNotification(error.response.data.message);
    }
};

function showMsgNotification(message) {
    const notificationDiv = document.getElementById('msg-notification');
    notificationDiv.innerHTML = `${message}`;
    notificationDiv.style.display = 'flex';
    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 3000);
};

function showNotification(message) {
    const notification = document.createElement('div');
    notification.innerHTML = `${message}`;
    notification.classList.add('notification');
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
};

closeGroupBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('groupName');
    localStorage.removeItem('groupMsgs');
    window.location.href = './chat.html';
})