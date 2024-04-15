const express = require("express");
const bcrypt = require("bcrypt");

const UsersDAO = require('../dao/users-dao');
const PostsDAO = require('../dao/posts-dao');
const common = require("../dao/common")

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
        hibaRegister: null,
        successRegister: null
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

        const posts = await PostsDAO.getPosts();
        const birthdays = await UsersDAO.getUsersBirthday();
        const usersfriends = await UsersDAO.getUsersFriendsById(current_id);

        let listeduserfriends = [];
        for (let i = 0; i < usersfriends.rows.length; i++) {
            listeduserfriends[i] = await UsersDAO.getUsersFriendsNameById(usersfriends.rows[i]);
        }
        //ezt valoszinuleg sokkal szebben meg lehetne oldani

        return res.render('main', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            posts: posts,
            birthdays: birthdays,
            //usersfriends: usersfriends,
            listeduserfriends: listeduserfriends
        });
    }else {
        return res.render("/")
    }
});
//end-region

//region-users

router.post("/login", async (req, res) => {
    let {email} = req.body;
    let {password} = req.body;

    const user = await UsersDAO.getUserByEmail(email);
    if (user.rows.length > 0) {
        const hashedPassword = user.rows[0][4];
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
            hibaLogin:"Email nem létezik",
            hibaRegister:null,
            successRegister: null
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
    if(!common.isDateValid(birthday)){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Érvényes születési dátumot adj meg!",
            successRegister: null
        });
    }
    if(vanemail.rows.length > 0){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Ezen az email-en már létezik fiók!",
            successRegister: null
        });
    }
    if (password!==password2){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Jelszó nem egyezik!",
            successRegister: null
        });
    }
    if (name.trim()===""||password.trim()===""||password2.trim()==="" || birthday.trim()==="" || email.trim()===""){
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Minden mezőt ki kell tölteni",
            successRegister: null
        });
    }
    const injectCheck = name + email + password;
    const regex = /['=*?#-]/g;
    if (regex.test(injectCheck)) {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:"Egyik mező sem tartalmazhat speciális karatert! (', =, ?, *, #, -)",
            successRegister: null
        });
    }
    bcrypt.hash(password, 10).then(async (hash) => {
        await UsersDAO.createUser(name, email, new Date(birthday).toISOString().slice(0, 10), hash, "ACTIVE", "USER");
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister:null,
            successRegister: "Sikeres regisztráció!"
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
    jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
        return res.render('profile',{
            current_name: decodedToken.name,
            current_birthday: decodedToken.birthday,
            current_role: decodedToken.role,
            current_id: decodedToken.id,
            current_status: decodedToken.status,
            errors: []
        })
    });
})


router.post("/changeUserData", async (req,res)=>{

    const token = req.cookies.jwt
    let errors = [];
    let {name, email, birthday, password, re_password } = req.body;
    let current_email,current_name, beNev,beSzul,beMail, beJel;
    jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
        current_email = decodedToken.email
        current_name = decodedToken.name
        beSzul = new Date(decodedToken.birthday).toISOString().slice(0,10)
    });
    beNev = current_name
    beMail = current_email
    let currentUser = await UsersDAO.getUserByEmail(current_email);

    if (currentUser.rows.length > 0){
        beJel = currentUser.rows[0][4]
    }
    if (name.trim() !== ""){
        beNev = name.trim()
    }
    if (birthday.trim() !== ""){
        beSzul = new Date(birthday).toISOString().slice(0,10)
    }
    if (email.trim() !== ""){
        beMail = email
    }
    const vanemail = await UsersDAO.getUserEmail(email);
    if(!common.isDateValid(beSzul)){
        if (errors.length === 0){
            errors.push({hibaChanges:"Érvényes születési dátumot adj meg!"})
        }
    }
    if(vanemail.rows.length > 0){
        if (errors.length === 0){
            errors.push({hibaChanges:"Ezen az email-en már létezik fiók!"})
        }
    }
    if (password!==re_password && password.trim() !== ""){
        if (errors.length === 0){
            errors.push({hibaChanges:"Jelszó nem egyezik!"})
        }
    }
    const injectCheck = name + email + password;
    const regex = /['=*?#-]/g;
    if (regex.test(injectCheck)) {
        if (errors.length === 0){
            errors.push({hibaChanges:"Egyik mező sem tartalmazhat speciális karatert! (', =, ?, *, #, -)"})
        }
    }
    if (errors.length === 0){
        bcrypt.hash(password, 10).then( (hash) => {
            if (password.trim() === ""){
                hash = beJel
            }
            UsersDAO.updateUser(beNev, beMail, beSzul, hash, current_email).then(()=>{
                errors.push({success:"Sikeres adatmódosítás"})
                return res.render("profile",{
                    current_name: current_name,errors: errors
                })
            })
        }).catch(err => {
            if (errors.length === 0){
                errors.push({hibaChanges:"Sikeretelen adatmódosítás"})
            }
            return res.status(500).send("Internal Server Error");
        });
    }else {
        return res.render("profile",{
            current_name: current_name,errors: errors
        })
    }

})
//end-region

//region-posts




router.post("/post-add-new", async (req, res) => {

    const token = req.cookies.jwt;
    let current_id;

    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_id = decodedToken.id;
        });
    }

    let posztSzoveg = req.body.posztSzoveg;
    if (posztSzoveg.length === 0){
        return res.redirect('/main');
    }

    await PostsDAO.postCreateNoGroup(posztSzoveg, current_id);
    return res.redirect('/main');


});
router.post("/post-like", async (req, res) => {
    let postId = req.body.postId;
    await PostsDAO.postAddLike(postId);
    return res.redirect('/main');

});

router.post("/post-modify", async (req, res) => {
    let postId = req.body.postId;
    let postSzoveg = req.body.modifySzoveg;
    await PostsDAO.postModify(postSzoveg, postId);
    return res.redirect('/main');

});


router.post("/post-delete", async (req, res) => {
    let postId = req.body.postId;
    await PostsDAO.postDelete(postId);
    return res.redirect('/main');
});


//end-region

module.exports = router;