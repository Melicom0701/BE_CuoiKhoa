const express = require('express');
const userRoute = require('./userManager/userManager')
const authRoute = require('./login/route')
const pollRoute = require('./poll/poll')
const pollClient= require('./poll/pollClient')
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const roleRoute = require('./roleManagerment/roleRoute');
const { authenticateToken }= require('./midleware/checkToken')
require('dotenv').config();
const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined'))
// login-- self-manager
app.use('/auth',authRoute)
//User manager
app.use('/user', authenticateToken, userRoute);
// poll
app.use('/poll', pollRoute);
//pollClient
app.use('/pollClient', pollClient);
//role manager
app.use('/role', roleRoute)
app.use('/assets/img', express.static(path.join(__dirname, 'assets/img')));
// Khởi động server
app.listen(3000, () => {
    console.log('Server is running on port 3000 duy');
});
