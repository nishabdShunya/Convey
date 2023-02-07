const path = require('path');

// Importing third party packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { Op } = require('sequelize');

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
const ArchivedMessage = require('./models/archivedMsg');

// Using third party packages
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'HEAD']
}));
app.use(bodyParser.json());

// Static images folder
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);
app.use('/groupChat', groupChatRoutes);

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, `public/${req.url}`));
});

// Archiving 1 day old messages everyday 3am in the morning so as to lighten the message table
cron.schedule('0 3 * * *', async () => {
    const msgsToBeArchived = await Message.findAll({ where: { createdAt: { [Op.lte]: new Date(new Date() - (24 * 60 * 60 * 1000)) } } });
    for (const msgToBeArchived of msgsToBeArchived) {
        await ArchivedMessage.create({
            msg: msgToBeArchived.msg,
            fileURL: msgToBeArchived.fileURL,
            date: msgToBeArchived.date,
            time: msgToBeArchived.time,
            userId: msgToBeArchived.userId,
            groupId: msgToBeArchived.groupId
        });
    }
    await Message.destroy({ where: { createdAt: { [Op.lte]: new Date(new Date() - (60 * 1000)) } } });
});

// Associations
User.hasMany(Message);
Message.belongsTo(User);
Group.belongsToMany(User, { through: GroupAndUsers });
User.belongsToMany(Group, { through: GroupAndUsers });
Group.hasMany(Message);
Message.belongsTo(Group);

sequelize.sync({force:true})
    .then(app.listen(3000))
    .catch(err => console.log(err));