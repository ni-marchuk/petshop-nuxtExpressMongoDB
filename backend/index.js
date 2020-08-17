const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const api = require('./routes/api');
const pets = require('./mock');
const path = require('path');

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api', api);
app.use(morgan('dev'));
app.use('/public', express.static(path.join(__dirname, 'public')));


let mongoUrl = 'mongodb+srv://nikita-ni:qwer4321@cluster0.c8kc5.mongodb.net/myDataBase';

let connectWithRetry = async () => {
    return mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        },
        function (err) {
            if (err) {
                console.error('Failed to connect to mongo on startup - retrying in 2 sec', err);
                setTimeout(connectWithRetry, 2000)
            }
        }).then(res => {
        console.log('connected')
    })
};



const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error'));

db.once('open', () => {
    app.listen(27017, () => {
        console.log('Running')
    });

    const petCollection = db.collection('pets');

    petCollection.estimatedDocumentCount((err, count) => {
        if (count) return;
        petCollection.insertMany(pets)
    })
});

module.exports = {
    path: '/api',
    handler: app,
    bodyParser: bodyParser,
    connectWithRetry: connectWithRetry()
};
