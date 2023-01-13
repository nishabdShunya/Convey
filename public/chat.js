const otherUsersList = document.getElementById('other-users');
const loggedUser = document.getElementById('logged-user');

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