const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const app = express();
const PORT = 3000;
const url = process.env.MONGODB_URL || 'mongodb://localhost:27017/project-mongodb';

// const expense = require('./controllers/expense.controller');

const connect = async () => {
    const db = await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology:true });
    try{
        console.log('Successfully connected to the database.');
    }catch(err){
        console.log('Could not connect to the database. Error ',err);
        db.exit();
    }
};

connect();

app.set('view engine','ejs');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static('public'));

app.get('/', async (req,res)=>{
    res.redirect('expense');
});

require('./routes/expense.routes.js')(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});