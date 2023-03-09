module.exports = function(app, checkAuthenticated, checkNotAuthenticated) {

    //make a route /
    app.get('/', checkAuthenticated, (req, res) => {
        res.render("index.ejs", {
            name: req.user.name
        });
    });


    //make a route login
    app.get('/login', checkNotAuthenticated, (req, res) => {
        res.render("login.ejs")
        getUsers()
    });

    //make a register route
    app.get('/register', checkNotAuthenticated, (req, res) => {
        res.render("register.ejs")
        getUsers()
    });

    // post methods
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

}