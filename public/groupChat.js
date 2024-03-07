const membersList = document.getElementById('group-users');
const groupImg = document.getElementById('group-img');
const groupName = document.getElementById('group-name');
const groupAdmin = document.getElementById('group-admin');
const sendMsgForm = document.getElementById('send-msg-form');
const chat = document.getElementById('chat');
const closeGroupBtn = document.getElementById('close-group-btn');
const addMembersContainer = document.getElementById('add-members-container');
const addMemberInputs = document.getElementById('input');
const addMemberForm = document.getElementById('add-member-form');

const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

socket.on('connection', () => {
  console.log('User connected');
});

socket.on('newMessage', (message) => {

    const groupMessages =JSON.parse(localStorage.getItem('groupMsgs'));
    groupMessages.push(message);
    displayMessages(groupMessages);
    const numOfMsgs = groupMessages.length;
    const latestTenMsgs = [];
    if (numOfMsgs < 10) {
      for (let i = 0; i < numOfMsgs; i++) {
        latestTenMsgs.push(groupMessages[i]);
      }
    } else {
      for (let i = numOfMsgs - 10; i < numOfMsgs; i++) {
        latestTenMsgs.push(groupMessages[i]);
      }
    }
    localStorage.setItem('msgs', JSON.stringify(latestTenMsgs));
    // Scrolling down to the latest chat
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;

});

socket.on('newGroup', (group) => {
  loadMembers();
  loadGroupMessages();
});

socket.on('newMember', (member) => {
  membersList.innerHTML += `
    <li>
        <div>
                <img src="../${member.profile_pic}" class="group-user-img">
                ${member.name}
        </div>
    </li>`;
});

window.addEventListener('DOMContentLoaded', (event) => {
  event.preventDefault();
  loadMembers();
  loadGroupMessages();
});

async function loadMembers() {
  try {
    const chatGroup = localStorage.getItem('groupName');
    const response = await axios.get(
      `http://localhost:3000/groupChat/members?chatGroup=${chatGroup}`,
      {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      }
    );
    if (response.status === 200) {
      groupImg.src = `../${response.data.groupInfo.group_pic}`;
      groupName.innerText = `${response.data.groupInfo.name}`;
      const members = response.data.members;
      const loggedMember = members.filter(
        (member) => member.id === response.data.loggedUser.id
      )[0];
      const otherMembers = members.filter(
        (member) => member.id !== response.data.loggedUser.id
      );
      displayMembers(loggedMember, otherMembers);
      const notMembers = response.data.notMembers;
      addMemberInputs.innerHTML = '';
      for (let notMember of notMembers) {
        addMemberInputs.innerHTML += `<option value="${notMember.email}">${notMember.name}</option>`;
      }
    } else {
      showNotification('Something went wrong. Please try again.');
    }
  } catch (error) {
    showNotification(error.response.data.message);
  }
}

function displayMembers(loggedMember, otherMembers) {
  membersList.innerHTML = '';
  if (loggedMember.groupAndUsers.isAdmin) {
    addMembersContainer.style.display = 'flex';
    membersList.innerHTML += `
        <li>
            <div>
                <img src="../${loggedMember.profile_pic}" class="group-user-img">
                ${loggedMember.name}
                <span class="member">YOU</span>
                <span class="admin">ADMIN</span>
            </div>
        </li>`;
    for (let member of otherMembers) {
      if (member.groupAndUsers.isAdmin) {
        membersList.innerHTML += `
                <li>
                    <div>
                        <img src="../${member.profile_pic}" class="group-user-img">
                        ${member.name}
                        <span class="admin">ADMIN</span>
                    </div>
                </li>`;
      } else {
        membersList.innerHTML += `
                <li>
                    <div>
                        <img src="../${member.profile_pic}" class="group-user-img">
                        ${member.name}
                    </div>
                    <div>
                        <button class="make-admin-btn" title="Make Admin" onclick="makeAdmin('${member.groupAndUsers.id}')">
                            <img src="./MA.png" class="make-admin-btn-img">
                        </button>
                        <button class="remove-member-btn" title="Remove" onclick="removeMember('${member.groupAndUsers.id}')">
                            <img src="./RM.png" class="remove-member-btn-img">
                        </button>
                    </div>
                </li>`;
      }
    }
  } else {
    membersList.innerHTML += `
        <li>
            <div>
                <img src="../${loggedMember.profile_pic}" class="group-user-img">
                ${loggedMember.name}
                <span class="member">YOU</span>
            </div>
        </li>`;
    for (let member of otherMembers) {
      if (member.groupAndUsers.isAdmin) {
        membersList.innerHTML += `
                <li>
                    <div>
                        <img src="../${member.profile_pic}" class="group-user-img">
                        ${member.name}
                        <span class="admin">ADMIN</span>
                    </div>
                </li>`;
      } else {
        membersList.innerHTML += `
                <li>
                    <div>
                        <img src="../${member.profile_pic}" class="group-user-img">
                        ${member.name}
                    </div>
                </li>`;
      }
    }
  }
}

async function makeAdmin(groupAndUsersId) {
  try {
    const response = await axios.post(
      'http://localhost:3000/groupChat/make-admin',
      { groupAndUsersId: groupAndUsersId },
      {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      }
    );
    if (response.status === 201) {
      showNotification(`"${response.data.nameOfUserMadeAdmin}" made admin.`);
      loadMembers();
    } else {
      showNotification('Something went wrong. Please try again.');
    }
  } catch (error) {
    showNotification(error.response.data.message);
  }
}

async function removeMember(groupAndUsersId) {
  try {
    const response = await axios.delete(
      `http://localhost:3000/groupChat/remove-member/${groupAndUsersId}`,
      {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      }
    );
    if (response.status === 200) {
      showNotification(
        `"${response.data.nameOfMemberRemoved}" removed from the group.`
      );
      loadMembers();
    } else {
      showNotification('Something went wrong. Please try again.');
    }
  } catch (error) {
    showNotification(error.response.data.message);
  }
}

function loadGroupMessages() {
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
    // setInterval(async() => {
    //     const chatGroup = localStorage.getItem('groupName');
    // const response =  axios.get(`http://localhost:3000/groupChat/get-msgs/${chatGroup}?lastMsgId=${lastMsgId}`, {
    //     headers: {
    //         Authorization: localStorage.getItem('token')
    //     }
    // });
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
    //     localStorage.setItem('groupMsgs', JSON.stringify(latestTenMsgs));
    //     // Scrolling down to the latest chat
    //     const chatContainer = document.getElementById('chat-container');
    //     chatContainer.scrollTop = chatContainer.scrollHeight;
    // } else {
    //     showNotification('Something went wrong. Please try again.');
    // }\
    const chatGroup = localStorage.getItem('groupName');
    axios
      .get(
        `http://localhost:3000/groupChat/get-msgs/${chatGroup}?lastMsgId=${lastMsgId}`,
        {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        }
      )
      .then((response) => {
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
      })
      .catch((error) => {
        showNotification(error.response.data.message);
      });

    // }, 1000);
  } catch (error) {
    console.log(error);
    showNotification(error.response.data.message);
  }
}

function displayMessages(messages) {
  console.log(messages);
  chat.innerHTML = '';
  for (let message of messages) {
    if (message.dataValues.fileURL === null) {
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

async function sendMessage(event) {
  event.preventDefault();
  try {
    const sendMsgFormData = new FormData(sendMsgForm);
    const chatGroup = localStorage.getItem('groupName');
    const response = await axios.post(
      `http://localhost:3000/groupChat/add-msg?chatGroup=${chatGroup}`,
      sendMsgFormData,
      {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      }
    );
    if (response.status === 201) {
      showMsgNotification(response.data.message);
      loadGroupMessages();
      socket.emit('sendMessage', response.data);
      // Clearing the fields
      sendMsgForm.reset();
      // document.getElementById('msg-sent').value = '';
    } else {
      showNotification('Something went wrong. Please try again.');
    }
  } catch (error) {
    console.log(error);
    showNotification(error.response.data.message);
  }
}

function showMsgNotification(message) {
  const notificationDiv = document.getElementById('msg-notification');
  notificationDiv.innerHTML = `${message}`;
  notificationDiv.style.display = 'flex';
  setTimeout(() => {
      notificationDiv.style.display = 'none';
  }, 3000);
}

// For adding more members
addMemberForm.addEventListener('submit', addMember);

async function addMember(event) {
  event.preventDefault();
  try {
    const addMemberFormData = new FormData(addMemberForm);
    const addMemberObj = {
      addMemberInput: addMemberFormData.get('add-member-input'),
      groupName: localStorage.getItem('groupName'),
    };
    const response = await axios.post(
      'http://localhost:3000/groupChat/add-member',
      addMemberObj,
      {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      }
    );
    if (response.status === 201) {
      showNotification(`"${response.data.userAdded.name}" added to the group.`);
      loadMembers();
      // Clearing the input field
      document.getElementsByName('add-member-input')[0].value = '';
    } else {
      showNotification('Something went wrong. Please try again.');
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
}

closeGroupBtn.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.removeItem('groupMsgs');
  localStorage.removeItem('groupName');
  window.location.href = './chat.html';
});
