require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path = require('path');
const cookieParser= require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const { isActiveRoute } = require('./server/helpers/routeHelpers')

const connectDB = require('./server/config/db');

const app = express();
const PORT= 5000 || process.env.PORT;

// connect to mongo
connectDB()

app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret:"mysecret",
    resave:false,
    saveUnitialized:true,
    store: MongoStore.create({
        mongoUrl:process.env.MONGO_URI
    })
}))

// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressLayout);
app.set('layout', './layout/mainLayout');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/',require('./server/routes/mainRoute'));
app.use('/',require('./server/routes/adminRoute'));


app.listen(PORT, ()=>{
    console.log('App listening on port ',PORT);
})