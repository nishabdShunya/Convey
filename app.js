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

// Using third party packages
app.use(cors({
    origin:'*',
    methods:['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'HEAD']
}));
app.use(bodyParser.json());

// Routes
app.use('/user', userRoutes);

sequelize.sync()
    .then(app.listen(3000))
    .catch(err => console.log(err));