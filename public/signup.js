const username = document.getElementById('username');
const email = document.getElementById('email');
const phno = document.getElementById('phno');
const password = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const profilePicContainer = document.getElementById('profile-pic-container');
const profilePicForm = document.getElementById('profile-pic-form');
const profilePicImage = document.getElementById('profile-pic-image');

signupBtn.addEventListener('click', addUser);

async function addUser(event) {
    event.preventDefault();
    try {
        if (username.value === '' || email.value === '' || phno.value === '' || password.value === '') {
            showNotification('Please enter all the fields.');
        } else {
            const userObj = {
                name: username.value,
                email: email.value,
                phno: phno.value,
                password: password.value
            }
            const response = await axios.post('http://18.183.40.94:3000/user/add-user', userObj);
            if (response.status === 400) {
                showNotification(response.data.message);
            } else if (response.status === 403) {
                showNotification(response.data.message);
            } else if (response.status === 201) {
                showNotification(response.data.message);
                profilePicContainer.style.display = 'flex';
                profilePicForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    try {
                        let formData = new FormData(profilePicForm);
                        formData.set('email_copy', userObj.email);
                        const response = await axios.post('http://18.183.40.94:3000/user/add-profile-pic', formData);
                        if (response.status === 201) {
                            showNotification(response.data.message);
                            profilePicImage.src = `/${response.data.profile_pic}`;
                            setTimeout(() => {
                                window.location.href = './login.html';
                            }, 3000);
                        } else {
                            showNotification('Something went wrong. Please try again.')
                        }
                    } catch (error) {
                        showNotification(error.response.data.message);
                    }
                });
            } else {
                showNotification('Something went wrong. Please try again.');
            }
            // Clearing the fields
            username.value = '';
            email.value = '';
            phno.value = '';
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