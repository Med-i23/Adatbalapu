const express = require("express");
const bcrypt = require("bcrypt");

const UsersDAO = require('../dao/users-dao');

const jwt = require('jsonwebtoken')
const jwtSecret = require("./../config/auth.js");
const router = express.Router();

//main region
router.get("/", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name= decodedToken.name;
            current_birthday= decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
    }
    return res.render('index', {
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
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name= decodedToken.name;
            current_birthday= decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
    }


    return res.render('main', {
        current_name: current_name,
        current_role: current_role,
        current_id: current_id,
        current_birthday: current_birthday,
        current_status: current_status,
    });
});

//#region-users

router.post("/login", async(req, res) => {
    let {email} = req.body;
    let {password} = req.body;

    const user = await UsersDAO.getUserByEmail(email);
    const hashedPassword = user.rows[0][4];
    if (user){
        bcrypt.compare(password, hashedPassword).then(async function (result) {
            if (result) {
                const token = jwt.sign({
                        user: user,
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        birthday: user.birthday,
                        status: user.status,
                        role: user.role,
                    },
                    jwtSecret.jwtSecret
                );
                res.cookie("jwt", token, {
                    httpOnly: true
                });
                return res.redirect('/main')
            } else {
                return res.render('index', {
                    current_role: null,
                    token: null,
                    hibaLogin: "Helytelen jelszó",
                    hibaRegister: null
                });
            }
        });

    }else {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin:"Email nem létezik",
            hibaRegister:null
        });
    }
});

router.get("/logout", async(req, res) => {
    const token = req.cookies.jwt;
    let current_email;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_email = decodedToken.email;
        });
    }

    res.cookie("jwt", "", {
        maxAge: "1"
    })
    res.redirect("/")
});

router.post("/register", async(req, res) => {
    let {name} = req.body;
    let {email} = req.body;
    let {birthday} = req.body;
    let {password} = req.body;
    let {password2} = req.body;


    if (password!==password2){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Jelszó nem egyezik!"
        });
    }if (name===""||password===""||password2==="" || birthday==="" || email===""){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Minden mezőt ki kell tölteni"
        });
    }
    for (let i = 0; i < password.length; i++) {
        if(password.charAt(i) === "@" || password.charAt(i) === "'" || password.charAt(i) === "="){
            return res.render('index', {
                current_role: null,
                token: null,
                hibaLogin: null,
                hibaRegister:"A jelszó nem tartalmazhat speciális karatert!"
            });
        }
    }

    bcrypt.hash(password, 10).then(async (hash) => {
        await UsersDAO.createUser(name, email, new Date(birthday).toISOString().slice(0,10), hash, "ACTIVE", "USER");
    });
    return res.render('index', {
        current_role: null,
        token: null,
        hibaLogin: "Sikeres Regisztráció!",
        hibaRegister:null
    });
});



//#end-region

module.exports = router;