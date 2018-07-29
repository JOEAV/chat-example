const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const userManagement = require('./server/userManagement');
const gamesManagement = require('./server/gamesManagement')
const auth = require('./server/auth');
const chatManagement = require('./server/chat');
const app = express();

app.use(bodyParser.text());

app.use(express.static(path.resolve(__dirname, "..", "public")));

// app.get('/',auth.userAuthentication, (req, res, next) => {		
// 	console.log('root', req.session.id);	
// 	next();
// })

app.use('/users', userManagement);
app.use('/chat', chatManagement)
app.use('/lobby',gamesManagement)

app.listen(3000, console.log('Example app listening on port 3000!'));