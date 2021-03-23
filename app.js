const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const MySQLStore = require('express-mysql-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');

const Product = require('./models/product');
const USer = require('./models/user');

// var store = new Sequelize("shop", "root", "root", {
//     dialect: "sqlite",
//     storage: "./session.sqlite",
// });

var options = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'shop'
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// File Imports
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const sequelize = require('./util/database');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-Item');
const Order = require('./models/order');
const OrderItem = require('./models/order-Item');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
//session middleware
const sessionStore = new MySQLStore(options);
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

const csrfProtection = csrf();

app.use(csrfProtection)

app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findByPk(req.session.user.id)
    .then(user => {
        req.session.user = user;
        next();
    })
    .catch((err) => {
        console.log(err);
    });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(flash());

// myStore.sync();

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

//Relating the Tables
Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem}); 


sequelize.sync()//{force: true})
    // .then(result => {
    //     //Creating a dummy user
    //     return User.findByPk(1);
    //     //console.log(result);
    // })
    // .then(user => {
    //     if (!user) {
    //         return User.create({
    //             name: 'John',
    //             email: 'dummy@mail.com'
    //         })
    //     }
    //     return user;
    // })
    // .then(user => {
    //     return user.createCart();
        
    // })
    .then(cart => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
