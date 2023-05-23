const otherUsersList = document.getElementById('other-users');
const loggedUserImg = document.getElementById('logged-user-img');
const loggedUser = document.getElementById('logged-user');
const loggedUserEmail = document.getElementById('logged-user-email');
const sendMsgForm = document.getElementById('send-msg-form');
const chat = document.getElementById('chat');
const addMembers = document.getElementById('add-members');
const createGroupBtn = document.getElementById('create-group-btn');
const createGroupContainer = document.getElementById('create-group-container');
const createGroupContainerCloseBtn = document.getElementById(
  'create-group-container-close-btn'
);
const createGroupFormBtn = document.getElementById('create-group-form-btn');
const createGroupForm = document.getElementById('create-group-form');
const groupPicContainer = document.getElementById('group-pic-container');
const groupPicForm = document.getElementById('group-pic-form');
const groupPicImage = document.getElementById('group-pic-image');
const yourGroups = document.getElementById('your-groups');
const logoutBtn = document.getElementById('logout-btn');

window.addEventListener('DOMContentLoaded', (event) => {
  event.preventDefault();
  loadUsers();
  loadMessages();
});
const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

async function loadUsers() {
  try {
    const response = await axios.get(
      'http://localhost:3000/chat/online-users',
      {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      }
    );
    if (response.status === 200) {
      loggedUserImg.src = `../${response.data.loggedUser.profile_pic}`;
      loggedUser.innerText = `${response.data.loggedUser.name}`;
      loggedUserEmail.innerText = `(${response.data.loggedUser.email})`;
      const loggedUserGroups = response.data.loggedUserGroups;
      for (let group of loggedUserGroups) {
        const groupLI = `<li><img src="../${group.group_pic}">${group.name}</li>`;
        yourGroups.innerHTML += groupLI;
      }
      const otherUsers = response.data.otherUsers;
      for (let user of otherUsers) {
        const otherUser = `<li><img src="../${user.profile_pic}">${user.name}</li>`;
        otherUsersList.innerHTML += otherUser;
        const membersOptions = `<option value="${user.id}">${user.name}</option>`;
        addMembers.innerHTML += membersOptions;
      }
      createCustomSelect();
    } else {
      showNotification('Something went wrong. Please try again.');
    }
  } catch (error) {
    showNotification(error.response.data.message);
  }
}

function loadMessages() {
  try {
    // Getting the latest 10 messages from the local storage
    let oldMessages = [];
    let lastMsgId = 0;
    if (localStorage.getItem('msgs')) {
      if (JSON.parse(localStorage.getItem('msgs')).length !== 0) {
        oldMessages = JSON.parse(localStorage.getItem('msgs'));
        lastMsgId = oldMessages[oldMessages.length - 1].dataValues.id;
      }
    }
    // Calling backend for new messages
    // setInterval(async () => {
    // const response =  axios.get(`http://localhost:3000/chat/get-msgs?lastMsgId=${lastMsgId}`, {
    //     headers: {
    //         Authorization: localStorage.getItem('token')
    //     }
    // })
    // if (response.status === 200) {
    //     const newMessages = response.data.messages;
    //     let messages = newMessages;
    //     if (oldMessages.length > 0) {
    //         messages = [...oldMessages, ...newMessages];
    //     }
    //     // Displaying chat (latest 10 messages from local storage + new messages from backend) on screen
    //     displayMessages(messages);
    //     // Storing the latest 10 messages in the local storage
    //     const numOfMsgs = messages.length;
    //     const latestTenMsgs = [];
    //     if (numOfMsgs < 10) {
    //         for (let i = 0; i < numOfMsgs; i++) {
    //             latestTenMsgs.push(messages[i]);
    //         }
    //     } else {
    //         for (let i = numOfMsgs - 10; i < numOfMsgs; i++) {
    //             latestTenMsgs.push(messages[i]);
    //         }
    //     }
    //     localStorage.setItem('msgs', JSON.stringify(latestTenMsgs));
    //     // Scrolling down to the latest chat
    //     const chatContainer = document.getElementById('chat-container');
    //     chatContainer.scrollTop = chatContainer.scrollHeight;
    // }
    axios
      .get(`http://localhost:3000/chat/get-msgs?lastMsgId=${lastMsgId}`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const newMessages = response.data.messages;
          console.log(response.data)
          let messages = newMessages;
          console.log(messages);
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
          localStorage.setItem('msgs', JSON.stringify(latestTenMsgs));
          // Scrolling down to the latest chat
          const chatContainer = document.getElementById('chat-container');
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      })
      .catch((error) => {
        showNotification(error.response.data.message);
      });

    //  else {
    //         showNotification('Something went wrong. Please try again.');
    //     }
    // }, 1000);
  } catch (error) {
    showNotification(error.response.data.message);
  }
}

function displayMessages(messages) {
  chat.innerHTML = '';
  console.log(messages);
  for (let message of messages) {
    if (message?.dataValues?.fileURL === null) {
      const chatItem = `
            <li>
                <p id="msg-by">${message.by}</p>
                <div>
                    <p>${message.dataValues.msg}</p>
                </div>
                <p id="msg-time">${message.dataValues.date} (${twelveHourClock(
        message.dataValues.time
      )})</p>
            </li>`;
      chat.innerHTML += chatItem;
    } else {
      const chatItem = `
            <li>
                <p id="msg-by">${message.by}</p>
                <div>
                    <img src="${message.dataValues.fileURL}">
                    <p>${message.dataValues.msg}</p>
                </div>
                <p id="msg-time">${message.dataValues.date} (${twelveHourClock(
        message.dataValues.time
      )})</p>
            </li>`;
      chat.innerHTML += chatItem;
    }
  }
}

function twelveHourClock(time) {
  const splittedTime = time.split(':');
  const AMorPM = splittedTime[0] >= 12 ? 'PM' : 'AM';
  const hour = splittedTime[0] % 12 || 12;
  return `${hour} : ${splittedTime[1]} ${AMorPM}`;
}

sendMsgForm.addEventListener('submit', sendMessage);

socket.on('connection', () => {
  console.log('Connected to the server');
});

socket.on('newGroup', (group) => {
  const groups = JSON.parse(localStorage.getItem('groups'));
  groups.push(group);
  localStorage.setItem('groups', JSON.stringify(groups));
});

socket.on('newMessage', (message) => {
  const messages = JSON.parse(localStorage.getItem('msgs'));
  messages.push(message);
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
  localStorage.setItem('msgs', JSON.stringify(latestTenMsgs));
  // Scrolling down to the latest chat
  const chatContainer = document.getElementById('chat-container');
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

async function sendMessage(event) {
  event.preventDefault();
  try {
    const sendMsgFormData = new FormData(sendMsgForm);
    const response = await axios.post(
      'http://localhost:3000/chat/add-msg',
      sendMsgFormData,
      {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      }
    );
    if (response.status === 201) {
      socket.emit('sendMessage', response.data);

      showMsgNotification(response.data.message);
      loadMessages();
      // Clearing the message field
      sendMsgForm.reset();
    } else {
      showNotification('Something went wrong. Please try again.');
    }
  } catch (error) {
    showNotification(error.response.data.message);
  }
}

function showMsgNotification(message) {
  const notificationDiv = document.getElementById('msg-notification');
  notificationDiv.innerHTML = `${message}`;
  notificationDiv.style.display = 'flex';
  // setTimeout(() => {
  //     notificationDiv.style.display = 'none';
  // }, 3000);
}

createGroupBtn.addEventListener('click', () => {
  createGroupContainer.style.display = 'flex';
});

createGroupContainerCloseBtn.addEventListener('click', () => {
  createGroupContainer.style.display = 'none';
});

createGroupForm.addEventListener('submit', createGroup);

async function createGroup(event) {
  event.preventDefault();
  try {
    if (document.getElementById('group-name').value === '') {
      showNotification('Please provide your group a name.');
    } else {
      let createGroupFormData = new FormData(createGroupForm);
      const groupObj = {
        groupName: createGroupFormData.get('group_name'),
        membersId: createGroupFormData.getAll('members'),
      };
      const response = await axios.post(
        'http://localhost:3000/group/add-group',
        groupObj,
        {
          headers: { Authorization: localStorage.getItem('token') },
        }
      );
      if (response.status === 400) {
        showNotification(response.data.message);
      } else if (response.status === 403) {
        showNotification(response.data.message);
      } else if (response.status === 201) {
        socket.emit('newGroup', response.data);
        showNotification(response.data.message);
        groupPicContainer.style.display = 'flex';
        groupPicForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          try {
            let groupImageFormData = new FormData(groupPicForm);
            groupImageFormData.set('group_name', groupObj.groupName);
            const response = await axios.post(
              'http://18.183.40.94:3000/group/add-group-pic',
              groupImageFormData
            );
            if (response.status === 201) {
              showNotification(response.data.message);
              groupPicImage.src = `../${response.data.group_pic}`;
              // setTimeout(() => {
              //     window.location.href = './chat.html';
              // }, 3000);
            } else {
              showNotification('Something went wrong. Please try again.');
            }
          } catch (error) {
            showNotification(error.response.data.message);
          }
        });
      } else {
        showNotification('Something went wrong. Please try again.');
      }
    }
  } catch (error) {
    showNotification(error.response.data.message);
  }
}

yourGroups.addEventListener('click', (event) => {
  localStorage.setItem('groupName', event.target.innerText);
  window.location.href = './groupChat.html';
});

function showNotification(message) {
  const notification = document.createElement('div');
  notification.innerHTML = `${message}`;
  notification.classList.add('notification');
  document.body.appendChild(notification);
  // setTimeout(() => {
  //     document.body.removeChild(notification);
  // }, 3000);
}

// Creating a copy of select element for selecting group members
function createCustomSelect() {
  class CustomSelect {
    constructor(originalSelect) {
      this.originalSelect = originalSelect; // Grabbing the original select element
      this.customSelect = document.createElement('div'); // Creating a copy of the original select element
      this.customSelect.classList.add('select');
      // Creating a copy of select options
      this.originalSelect
        .querySelectorAll('option')
        .forEach((optionElement) => {
          const itemElement = document.createElement('div');
          itemElement.classList.add('select__item');
          itemElement.textContent = optionElement.textContent;
          this.customSelect.appendChild(itemElement);
          // Adding the toggle between selected and not selected
          itemElement.addEventListener('click', () => {
            if (itemElement.classList.contains('select__item--selected')) {
              this._deselect(itemElement);
            } else {
              this._select(itemElement);
            }
          });
        });
      this.originalSelect.insertAdjacentElement('afterend', this.customSelect); // displaying the copy
      this.originalSelect.style.display = 'none'; // hiding the original
    }
    // Selecting the original option on selection of its copy
    _select(itemElement) {
      const index = Array.from(this.customSelect.children).indexOf(itemElement);
      this.originalSelect.querySelectorAll('option')[index].selected = true;
      itemElement.classList.add('select__item--selected');
    }
    // Deselecting the original option on de-selection of its copy
    _deselect(itemElement) {
      const index = Array.from(this.customSelect.children).indexOf(itemElement);
      this.originalSelect.querySelectorAll('option')[index].selected = false;
      itemElement.classList.remove('select__item--selected');
    }
  }
  // Calling an instance of CustomSelect class on the original select element
  document.querySelectorAll('.custom-select').forEach((selectElement) => {
    new CustomSelect(selectElement);
  });
}

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.clear();
  window.location.href = './login.html';
});
