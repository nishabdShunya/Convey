const otherUsersList = document.getElementById('other-users');
const loggedUser = document.getElementById('logged-user');
const msgSent = document.getElementById('msg-sent');
const sendMsgBtn = document.getElementById('send-msg-btn');

window.addEventListener('DOMContentLoaded', async (event) => {
    event.preventDefault();
    const response = await axios.get('http://localhost:3000/chat/online-users', {
        headers: {
            Authorization: localStorage.getItem('token')
        }
    });
    loggedUser.innerText = `Welcome ${response.data.loggedUser.name}`;
    const otherUsers = response.data.otherUsers;
    for (let user of otherUsers) {
        const otherUser = `<li>${user.name}</li>`;
        otherUsersList.innerHTML += otherUser;
    }
});

sendMsgBtn.addEventListener('click', sendMessage);

async function sendMessage(event) {
    event.preventDefault();
    if (msgSent.value === '') {
        showNotification('Please enter a message');
    } else {
        const response = await axios.post('http://localhost:3000/chat/add-msg', { msgSent: msgSent.value }, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });
        console.log(response);
        // Clearing the message field
        msgSent.value = '';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.innerHTML = `${message}`;
    notification.classList.add('notification');
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
};