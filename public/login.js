const email = document.getElementById('email');
const password = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');

loginBtn.addEventListener('click', loginUser);

async function loginUser(event) {
    event.preventDefault();
    try {
        if (email.value === '' || password.value === '') {
            showNotification('Please enter all the fields.');
        } else {
            loginDetails = {
                email: email.value,
                password: password.value
            }
            const response = await axios.post('http://localhost:3000/user/login-user', loginDetails);
            if (response.status === 400 || response.status === 401 || response.status === 404) {
                showNotification(response.data.message);
            } else if (response.status === 201) {
                localStorage.setItem('token', response.data.token);
                showNotification(response.data.message);
                setTimeout(() => {
                    window.location.href = './chat.html';
                }, 3000);
            } else {
                showNotification('Something went wrong. Please try again.');
            }
            // Clearing the fields
            email.value = '';
            password.value = '';
        }
    } catch (error) {
        showNotification(error.response.data.message);
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