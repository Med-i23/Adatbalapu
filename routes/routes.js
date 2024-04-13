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
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
    }
    return res.render('index', {
        current_name: current_name,
        current_role: current_role,
        current_id: current_id,
        token: token,
        hibaLogin: null,
        hibaRegister: null
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
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
    }

    const posts = await UsersDAO.getUserPosts();
    const birthdays = await UsersDAO.getUsersBirthday();
    const usersfriends = await UsersDAO.getUsersFriendsById(current_id);
    //console.log(usersfriends[0]);
    //console.log(usersfriends);
    //console.log(birthdays);

    return res.render('main', {
        current_name: current_name,
        current_role: current_role,
        current_id: current_id,
        current_birthday: current_birthday,
        current_status: current_status,
        posts: posts,
        birthdays: birthdays,
        usersfriends: usersfriends
    });
});
//end-region

//region-users

router.post("/login", async (req, res) => {
    let {email} = req.body;
    let {password} = req.body;

    const user = await UsersDAO.getUserByEmail(email);
    console.log(user);
    const hashedPassword = user.rows[0][4];
    if (user.rows.length > 0) {
        bcrypt.compare(password, hashedPassword).then(async function (result) {
            if (result) {
                const token = jwt.sign({
                        id: user.rows[0][0],
                        name: user.rows[0][1],
                        email: user.rows[0][2],
                        birthday: user.rows[0][3],
                        status: user.rows[0][5],
                        role: user.rows[0][6]
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

    } else {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: "Email nem létezik",
            hibaRegister: null
        });
    }
});

router.get("/logout", async (req, res) => {
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

router.post("/register", async (req, res) => {
    let {name, email, birthday, password, password2} = req.body;

    const vanemail = await UsersDAO.getUserEmail(email);
    if (vanemail.rows.length > 0) {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: "Ezen az ewmail-en már létezik fiók!"
        });
    }

    if (password !== password2) {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: "Jelszó nem egyezik!"
        });
    }
    if (name === "" || password === "" || password2 === "" || birthday === "" || email === "") {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: "Minden mezőt ki kell tölteni"
        });
    }
    const injectCheck = name + email + password;
    const regex = /['=*?]/g;
    if (regex.test(injectCheck)) {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: "A jelszó nem tartalmazhat speciális karatert! (', =, ?, *)"
        });
    }
    bcrypt.hash(password, 10).then(async (hash) => {
        await UsersDAO.createUser(name, email, new Date(birthday).toISOString().slice(0, 10), hash, "ACTIVE", "USER");
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: "Sikeres Regisztráció!",
            hibaRegister: null
        });
    }).catch(err => {
        console.error("Felhasználó létrehozás hiba:", err);
        return res.status(500).send("Internal Server Error");
    });
});

//end-region


// connection-region
router.get("/connection", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
    }

    const users = await UsersDAO.getUsers();
    if (users) {
        return res.render('connection', {
            users: users,
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            correctResult: 'Adatbázis csatlakoztatva'
        });
    }
    return res.render('connection', {
        users: users,
        current_name: current_name,
        current_role: current_role,
        current_id: current_id,
        current_birthday: current_birthday,
        current_status: current_status,
        wrongResult: 'Adatbázis nem csatlakozik'
    });
});

router.get("/profile", async (req, res) => {
    const token = req.cookies.jwt;
    console.log(token)
    jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
       return res.render('profile',{
           current_name: decodedToken.name,
           current_birthday: decodedToken.birthday,
           current_role: decodedToken.role,
           current_id: decodedToken.id,
           current_status: decodedToken.status
       })
    });
})

//end-region

module.exports = router;