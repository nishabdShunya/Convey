const path = require('path');

// Importing third party packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

// Invoking the app
const app = express();
dotenv.config();

// Importing my exports
const sequelize = require('./util/database');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');
const groupChatRoutes = require('./routes/groupChat');
const User = require('./models/user');
const Message = require('./models/msg');
const Group = require('./models/group');
const GroupAndUsers = require('./models/groupAndUsers');

// Using third party packages
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'HEAD']
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static images folder
app.use(express.static(path.join(__dirname, 'public/profilePics')));

// Routes
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);
app.use('/groupChat', groupChatRoutes);

// Associations
User.hasMany(Message);
Message.belongsTo(User);
Group.belongsToMany(User, { through: GroupAndUsers });
User.belongsToMany(Group, { through: GroupAndUsers });
Group.hasMany(Message);
Message.belongsTo(Group);

sequelize.sync()
    .then(app.listen(3000))
    .catch(err => console.log(err));