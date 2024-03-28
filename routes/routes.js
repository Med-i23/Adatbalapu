const express = require("express");
const bcrypt = require("bcrypt");

const UsersDAO = require('../dao/users-dao');

const jwt = require('jsonwebtoken')
const jwtSecret = require("./../config/auth.js");
const router = express.Router();

//main region
router.get("/", async (req, res) => {
    const token = req.cookies.jwt;
    let current_username;
    let current_name;
    let current_role;
    let current_id;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_username = decodedToken.username;
            current_name= decodedToken.name;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
        });
    }
    return res.render('index', {
        current_username: current_username,
        current_name:current_name,
        current_role: current_role,
        current_id: current_id,
        token: token,
        hibaLogin:null,
        hibaRegister:null
    });
});

router.get("/main", async (req, res) => {
    const token = req.cookies.jwt;
    let current_username;
    let current_role;
    let current_id;
    let current_name;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_username = decodedToken.username;
            current_name= decodedToken.name;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
        });
    }


    return res.render('main', {
        current_username: current_username,
        current_name:current_name,
        current_role: current_role,
        current_id: current_id,
    });
});

//#region-users

router.post("/login", async(req, res) => {
    let {username} = req.body;
    let {password} = req.body;

    const user = await new UsersDAO().getUsersByUserName(username);

    if (user){
        bcrypt.compare(password, user.password).then(async function (result) {
            if (result) {
                const token = jwt.sign({
                        user: user,
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        role: user.role
                    },
                    jwtSecret.jwtSecret
                );
                res.cookie("jwt", token, {
                    httpOnly: true
                });
                await new UsersDAO().changeUserLoggedin(username);
                return res.redirect('/main')
            } else {
                return res.render('index', {
                    current_role: null,
                    token: null,
                    hibaLogin: "Invalid password",
                    hibaRegister: null
                });

            }
        });

    }else {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin:"Username doesn't exists",
            hibaRegister:null
        });
    }
});

router.get("/logout", async(req, res) => {
    const token = req.cookies.jwt;
    let current_username;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_username = decodedToken.username;
        });
    }
    await new UsersDAO().changeUserLoggedin(current_username);

    res.cookie("jwt", "", {
        maxAge: "1"
    })
    res.redirect("/")
});

router.post("/register", async(req, res) => {
    let {name} = req.body;
    let {username} = req.body;
    let {password} = req.body;
    let {password2} = req.body;

    const van_e_user = await new UsersDAO().getUsersByUserName(username);
    if (van_e_user){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Username already taken"
        });
    }if (password!==password2){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Passwords doesn't match"
        });
    }if (name===""||password===""||password2===""||username===""){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Fill out everything"
        });

    }

    bcrypt.hash(password, 10).then(async (hash) => {
        await new UsersDAO().createUsers(name, username, hash, "ROLE_STUDENT");
    });
    return res.render('index', {
        current_role: null,
        token: null,
        hibaLogin: "Register successful!",
        hibaRegister:null
    });

});



//#end-region

module.exports = router;