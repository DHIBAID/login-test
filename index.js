//import dependencies
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const fs = require('fs');


//make an app
const app = express();
let users;

function getUsers() {
    fs.readFile(__dirname + "/db/users.json", "utf8", (err, data) => {
        if (err) throw err;
        users = JSON.parse(data);
    });
}

app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {
        name: req.user.name
    });
});


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
    getUsers()
});

app.get('/register', checkNotAuthenticated, (req, res) => {
    getUsers()
    res.render("register.ejs")
});

app.post("/register", checkNotAuthenticated, async(req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        console.log(users)

        fs.writeFileSync(__dirname + '/db/users.json', JSON.stringify(users), (err) => {
            if (err) res.redirect("/register");
        });
        res.redirect("/login");
    } catch {
        res.redirect("/register");
    }
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
});


const initializePassport = require('./app/passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


// use ejs as view engine
app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/views/public'));
app.use(express.urlencoded({
    extended: false
}));
app.use(flash())
app.use(session({
    secret: 'some-very-secure-token',
    resave: false,
    saveUninitialized: false
}))
app.use(methodOverride('_method'))

app.use(passport.initialize());
app.use(passport.session());

app.listen(3000, () => {
    console.log('listening on port 3000');
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}