const express = require("express");
const bcrypt = require("bcrypt");

const UsersDAO = require('../dao/users-dao');
const PostsDAO = require('../dao/posts-dao');
const FriendsDAO = require('../dao/friends-dao');
const GroupsDAO = require('../dao/groups-dao');
const MessagesDAO = require('../dao/messages-dao');
const NotificationsDAO = require('../dao/notifications-dao');
const PicturesDAO = require("../dao/pictures-dao");
const common = require("../dao/common")

const jwt = require('jsonwebtoken')
const jwtSecret = require("./../config/auth.js");
const {getGroups} = require("../dao/groups-dao");
const {TIMESTAMP2} = require("mysql/lib/protocol/constants/types");
const router = express.Router();

const multer = require('multer');
const path = require('path');
const {getOwnPictures, getOwnAlbums} = require("../dao/pictures-dao");


//image uploader initailize
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename file if needed
    }
});

const upload = multer({storage: storage});

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
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        let users = await UsersDAO.getActualUsers(current_id)
        for (let i = 0; i < users.length; i++) {
            let friends = await FriendsDAO.areTheyFriends(current_id, users[i][0]);
            users[i].push(friends);
        }
        let suggestable = []
        for (let i = 0; i < users.length; i++) {
            if (users[i][7] === false && Math.random() > 0.8){
                suggestable.push(users[i])
            }
        }
        const posts = await PostsDAO.getPosts();
        const birthdays = await UsersDAO.getUsersBirthday(current_id);
        const usersfriends = await FriendsDAO.getUsersFriendsById(current_id);
        const comments = await PostsDAO.getComments();
        //console.log("kommentek: " + getComments.rows);
        //Átírni a szüliket-> csak friendek láthassák + ne látszódjon a saját, DELETED_USER
        return res.render('main', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            posts: posts,
            birthdays: birthdays,
            usersfriends: usersfriends,
            comments: comments,
            suggestable
        });
    } else {
        return res.redirect("/")
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
                    hibaLogin: "Helytelen email vagy jelszó",
                    hibaRegister: null,
                    successRegister: null
                });
            }
        });

    } else {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: "Helytelen email vagy jelszó",
            hibaRegister: null,
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
    if (!common.isDateValid(birthday)) {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: "Érvényes születési dátumot adj meg!",
            successRegister: null
        });
    }
    if (vanemail.rows.length > 0) {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: "Ezen az email-en már létezik fiók!",
            successRegister: null
        });
    }
    if (password !== password2) {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: "Jelszó nem egyezik!",
            successRegister: null
        });
    }
    if (name.trim() === "" || password.trim() === "" || password2.trim() === "" || birthday.trim() === "" || email.trim() === "") {
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: "Minden mezőt ki kell tölteni",
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
            hibaRegister: "Egyik mező sem tartalmazhat speciális karatert! (', =, ?, *, #, -)",
            successRegister: null
        });
    }
    bcrypt.hash(password, 10).then(async (hash) => {
        await UsersDAO.createUser(name, email, new Date(birthday).toISOString().slice(0, 10), hash, "ACTIVE", "USER");
        return res.render('index', {
            current_role: null,
            token: null,
            hibaLogin: null,
            hibaRegister: null,
            successRegister: "Sikeres regisztráció!"
        });
    }).catch(err => {
        console.error("Felhasználó létrehozás hiba:", err);
        return res.status(500).send("Internal Server Error");
    });
});

//end-region
//profile-region
router.get("/profile", async (req, res) => {
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

        return res.render('profile', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status
        });
    } else {
        return res.redirect('/logout');
    }

});

router.get("/otherProfile:id", async (req, res) => {
    const token = req.cookies.jwt;
    let id = req.params.id;
    const otheruser = await UsersDAO.getUsersById(id);
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

        const aretheyfriends = await FriendsDAO.areTheyFriends(current_id, id);
        if (aretheyfriends) {
            return res.render('otherProfile', {
                otheruser: otheruser,
                current_name: current_name,
                current_role: current_role,
                current_id: current_id,
                current_birthday: current_birthday,
                current_status: current_status,
                friends: true
            })
        } else {
            return res.render('otherProfile', {
                otheruser: otheruser,
                current_name: current_name,
                current_role: current_role,
                current_id: current_id,
                current_birthday: current_birthday,
                current_status: current_status,
                friends: null
            })
        }

    } else {
        return res.redirect('/logout');
    }


});

router.get("/changeUserDataOf", async (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            return res.render('changeUserDataOf', {
                current_name: decodedToken.name,
                current_birthday: decodedToken.birthday,
                current_role: decodedToken.role,
                current_id: decodedToken.id,
                current_status: decodedToken.status,
                errors: []
            })
        });
    } else {
        return res.redirect('/logout');
    }

});

router.post("/changeUserDataOf:name", async (req, res) => {
    const token = req.cookies.jwt
    let errors = [];
    let {name, email, birthday, password, re_password} = req.body;
    let current_email, current_name, beNev, beSzul, beMail, beJel;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_email = decodedToken.email
            current_name = decodedToken.name
            beSzul = new Date(decodedToken.birthday).toISOString().slice(0, 10)
        });
        beNev = current_name
        beMail = current_email
        let currentUser = await UsersDAO.getUserByEmail(current_email);

        if (currentUser.rows.length > 0) {
            beJel = currentUser.rows[0][4]
        }
        if (name.trim() !== "") {
            beNev = name.trim()
        }
        if (birthday.trim() !== "") {
            beSzul = new Date(birthday).toISOString().slice(0, 10)
        }
        if (email.trim() !== "") {
            beMail = email
        }
        const vanemail = await UsersDAO.getUserEmail(email)
        if (!common.isDateValid(beSzul)) {
            if (errors.length === 0) {
                errors.push({hibaChanges: "Érvényes születési dátumot adj meg!"})
            }
        }
        if (vanemail.rows.length > 0) {
            if (errors.length === 0) {
                errors.push({hibaChanges: "Ezen az email-en már létezik fiók!"})
            }
        }
        if (password !== re_password && password.trim() !== "") {
            if (errors.length === 0) {
                errors.push({hibaChanges: "Jelszó nem egyezik!"})
            }
        }
        const injectCheck = name + email + password;
        const regex = /['=*?#-]/g;
        if (regex.test(injectCheck)) {
            if (errors.length === 0) {
                errors.push({hibaChanges: "Egyik mező sem tartalmazhat speciális karatert! (', =, ?, *, #, -)"})
            }
        }
        if (errors.length === 0) {
            bcrypt.hash(password, 10).then((hash) => {
                if (password.trim() === "") {
                    hash = beJel
                }
                UsersDAO.updateUser(beNev, beMail, beSzul, hash, current_email).then(() => {
                    errors.push({success: "Sikeres adatmódosítás"})
                    res.clearCookie('jwt')
                    const token = jwt.sign({
                            id: currentUser.rows[0][0],
                            name: beNev,
                            email: beMail,
                            birthday: beSzul,
                            status: currentUser.rows[0][5],
                            role: currentUser.rows[0][6]
                        },
                        jwtSecret.jwtSecret
                    );
                    res.cookie("jwt", token, {
                        httpOnly: true
                    });

                    return res.render("changeUserDataOf", {
                        current_name: beNev, errors: errors
                    })
                })
            }).catch(err => {
                if (errors.length === 0) {
                    errors.push({hibaChanges: "Sikeretelen adatmódosítás"})
                }
                return res.status(500).send("Internal Server Error");
            });
        } else {
            return res.render("changeUserDataOf", {
                current_name: beNev, errors: errors
            })
        }
    } else {
        return res.redirect('/logout');
    }

})

router.get("/user-delete", async (req, res) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            UsersDAO.deleteUser(decodedToken.id).then(() => {
                res.clearCookie('jwt')
                res.redirect('/')
            })
        });
    } else {
        return res.redirect('/logout');
    }

})

// end-region

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


        const users = await UsersDAO.getUsers();
        if (users) {
            return res.render('connection', {
                users: users,
                current_name: current_name,
                current_role: current_role,
                current_id: current_id,
                current_birthday: current_birthday,
                current_status: current_status,
                adminHiba: null
            });
        }
        return res.render('connection', {
            users: users,
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            adminHiba: null
        });
    } else {
        return res.redirect('login');
    }
});

router.post("/deleteUser:id", async (req, res) => {
    const token = req.cookies.jwt;
    let id = req.params.id;
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
        const users = await UsersDAO.getUsers();
        const roleArray = await UsersDAO.adminCheck(id);
        const role = roleArray[0];
        if (role === "ADMIN") {
            return res.render('connection', {
                users: users,
                current_name: current_name,
                current_role: current_role,
                current_id: current_id,
                current_birthday: current_birthday,
                current_status: current_status,
                adminHiba: "Admin törlése nem megengedett"
            });
        } else {
            await UsersDAO.deleteUser(id);
            return res.redirect('/connection');
        }
    } else {
        return res.redirect('login');
    }


});

//end-region

//region-posts

router.post("/post-add-new", async (req, res) => {
    const token = req.cookies.jwt;
    let current_id;

    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_id = decodedToken.id;
        });
        let posztSzoveg = req.body.posztSzoveg;

        if (posztSzoveg.length === 0) {
            return res.redirect('/main');
        }

        await PostsDAO.postCreate(null, posztSzoveg, current_id);
        return res.redirect('/main');
    } else {
        return res.redirect('/logout');
    }
});
router.post("/post-like", async (req, res) => {
    let postId = req.body.postId;
    const token = req.cookies.jwt;
    if (token) {
        await PostsDAO.postAddLike(postId);
        return res.redirect('/main');
    } else {
        return res.redirect('/logout');
    }


});

router.post("/post-modify", async (req, res) => {
    let postId = req.body.postId;
    let postSzoveg = req.body.modifySzoveg;
    const token = req.cookies.jwt;
    if (token) {
        await PostsDAO.postModify(postSzoveg, postId);
        return res.redirect('/main');
    } else {
        return res.redirect('/logout');
    }
});


router.post("/post-delete", async (req, res) => {
    let postId = req.body.postId;
    const token = req.cookies.jwt;
    if (token) {
        await PostsDAO.postDelete(postId);
        return res.redirect('/main');
    } else {
        return res.redirect('/logout');
    }
});
router.post("/post-add-comment", async (req, res) => {
    let postId = req.body.postId;
    let szoveg = req.body.kommentInput;

    if (szoveg.length < 3) {
        console.log("Rövid a komment!!!", szoveg);
        return res.redirect('/main');
    }

    console.log("a szoveg: " + szoveg);
    const token = req.cookies.jwt;
    let current_id;


    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_id = decodedToken.id;
        });

        await PostsDAO.postAddComment(postId, current_id, szoveg);
        return res.redirect('/main');
    } else {
        return res.redirect('/logout');
    }
})


//end-region

//region-groups

router.get("/groups_all", async (req, res) => {
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

        const groups = await GroupsDAO.getGroups();
        const isThisOwnGroups = false;
        const groupCheckOut = false;
        const groupPosts = [];
        const comments = await PostsDAO.getComments();

        return res.render('groups', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            //posts: posts,
            groups: groups,
            isThisOwnGroups: isThisOwnGroups,
            groupCheckOut: groupCheckOut,
            groupPosts: groupPosts,
            currentGroup: [],
            comments: comments
        });
    } else {
        return res.redirect('/logout');
    }
});

router.get("/groups_own", async (req, res) => {
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
        const groups = await GroupsDAO.getGroupsById(current_id);
        const isThisOwnGroups = true;
        const groupCheckOut = false;
        const groupPosts = [];
        const comments = await PostsDAO.getComments();
        return res.render('groups', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            groups: groups,
            isThisOwnGroups: isThisOwnGroups,
            groupCheckOut: groupCheckOut,
            groupPosts: groupPosts,
            currentGroup: [],
            comments: comments
        });
    } else {
        return res.redirect('/logout');
    }
});
router.post("/group-create-new", async (req, res) => {

    const token = req.cookies.jwt;
    let current_id;

    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_id = decodedToken.id;
        });
        let csoportNeve = req.body.csoportNeve;

        if (csoportNeve.length === 0) {
            return res.redirect('/groups_own');
        }

        await GroupsDAO.groupCreate(csoportNeve, current_id);
        return res.redirect('/groups_own');
    } else {
        return res.redirect('/logout');
    }

});
router.post("/group-delete", async (req, res) => {
    let groupId = req.body.groupId;
    const token = req.cookies.jwt;
    if (token) {
        await GroupsDAO.groupDelete(groupId);
        return res.redirect('/groups_own');
    } else {
        return res.redirect('/logout');
    }
});
router.post("/group-join", async (req, res) => {
    let groupId = req.body.groupId;
    const token = req.cookies.jwt;
    if (token) {
        let current_name, current_birthday, current_role, current_id, current_status;
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        let isItIn = await GroupsDAO.isUserInGroup(current_id, groupId)
        if (isItIn) {
            await GroupsDAO.joinToGroup(groupId, current_id)
        }
        return res.redirect('/groups_all');
    } else {
        return res.redirect("/logout")
    }

});


router.get("/group-refresh", async (req, res) => {
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
        const groups = await GroupsDAO.getGroupsById(current_id);
        const isThisOwnGroups = true;
        const groupCheckOut = true;
        const currentGroupId = req.query.currentGroupId;
        //console.log(currentGroupId);
        const groupPosts = await GroupsDAO.getGroupsPosts(currentGroupId)
        // console.log(currentGroupId);
        // console.log(groupPosts.rows);
        const comments = await PostsDAO.getComments();

        let current_group = await GroupsDAO.getCurrentGroupById(currentGroupId)
        current_group = current_group.rows[0]
        let memberNumber = await GroupsDAO.getMemberNumberOfGroup(currentGroupId)
        return res.render('groups', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            groups: groups,
            isThisOwnGroups: isThisOwnGroups,
            groupCheckOut: groupCheckOut,
            groupPosts: groupPosts,
            currentGroupId: currentGroupId,
            currentGroup: current_group,
            comments: comments,
            memberNumber
        });
    } else {
        return res.redirect('/logout');
    }
});


router.post("/group-checkout", async (req, res) => {
    let currentGroupId = req.body.groupId;
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
        const groups = await GroupsDAO.getGroupsById(current_id);
        let current_group = await GroupsDAO.getCurrentGroupById(currentGroupId)
        current_group = current_group.rows[0]
        const groupPosts = await GroupsDAO.getGroupsPosts(currentGroupId);
        //console.log(groupPosts.rows);
        const isThisOwnGroups = true;
        const groupCheckOut = true;
        let memberNumber = await GroupsDAO.getMemberNumberOfGroup(currentGroupId)
        const comments = await PostsDAO.getComments();
        //console.log(currentGroupId);
        return res.render('groups', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            groups: groups,
            isThisOwnGroups: isThisOwnGroups,
            groupCheckOut: groupCheckOut,
            currentGroupId: currentGroupId,
            groupPosts: groupPosts,
            currentGroup: current_group,
            comments: comments,
            memberNumber
        });
    } else {
        return res.redirect('/logout');
    }
});


router.post("/post-add-new-into-roup", async (req, res) => {
    let currentGroupId = req.body.currentGroupId;
    const token = req.cookies.jwt;
    let current_id;

    //console.log(currentGroupId);
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_id = decodedToken.id;
        });
        let posztSzoveg = req.body.posztSzoveg;
        if (posztSzoveg.length === 0) {
            return res.redirect(`/group-refresh?currentGroupId=${currentGroupId}`);
        }

        await PostsDAO.postCreate(currentGroupId, posztSzoveg, current_id);
        return res.redirect(`/group-refresh?currentGroupId=${currentGroupId}`);
    } else {
        return res.redirect('/logout');
    }


});

router.post("/post-like-group", async (req, res) => {
    let postId = req.body.postId;
    let currentGroupId = req.body.currentGroupId;
    const token = req.cookies.jwt;
    if (token) {
        await PostsDAO.postAddLike(postId);
        return res.redirect(`/group-refresh?currentGroupId=${currentGroupId}`);
    } else {
        return res.redirect('/logout');
    }
});



router.post("/post-add-comment-inGroup", async (req, res) => {
    let postId = req.body.postId;
    let szoveg = req.body.kommentInput;
    let currentGroupId = req.body.currentGroupId;
    if (szoveg.length < 3) {
        console.log("Rövid a komment!!!", szoveg);
        return res.redirect(`/group-refresh?currentGroupId=${currentGroupId}`);
    }

    //console.log("a szoveg: " + szoveg);
    const token = req.cookies.jwt;
    let current_id;


    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_id = decodedToken.id;
        });

        await PostsDAO.postAddComment(postId, current_id, szoveg);
        return res.redirect(`/group-refresh?currentGroupId=${currentGroupId}`);
    } else {
        return res.redirect('/logout');
    }
})


router.post("/post-modify-group", async (req, res) => {
    let postId = req.body.postId;
    let postSzoveg = req.body.modifySzoveg;
    let currentGroupId = req.body.currentGroupId;

    const token = req.cookies.jwt;
    if (token) {
        await PostsDAO.postModify(postSzoveg, postId);
        return res.redirect(`/group-refresh?currentGroupId=${currentGroupId}`);
    } else {
        return res.redirect('/logout');
    }

});

router.post("/post-delete-group", async (req, res) => {
    let postId = req.body.postId;
    let currentGroupId = req.body.currentGroupId;

    const token = req.cookies.jwt;
    if (token) {
        await PostsDAO.postDelete(postId);
        return res.redirect(`/group-refresh?currentGroupId=${currentGroupId}`);
    } else {
        return res.redirect('/logout');
    }
});

//end-region

// router.get("/groups_all", async (req, res) => {
//     const token = req.cookies.jwt;
//     jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
//         return res.render('groups_all',{
//             current_name: decodedToken.name,
//             current_birthday: decodedToken.birthday,
//             current_role: decodedToken.role,
//             current_id: decodedToken.id,
//             current_status: decodedToken.status,
//             errors: []
//         })
//     });
// });

//people-region

router.get("/people", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id

    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        const usersfriends = await FriendsDAO.getUsersFriendsById(current_id)
        let users = await UsersDAO.getActualUsers(current_id)
        for (let i = 0; i < users.length; i++) {
            let friends = await FriendsDAO.areTheyFriends(current_id, users[i][0]);
            users[i].push(friends);
        }
        let suggestable = []
        for (let i = 0; i < users.length; i++) {
            if (users[i][7] === false && Math.random() > 0.7){
                suggestable.push(users[i])
            }
        }
        return res.render('people', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            usersfriends: usersfriends,
            users: users
        });
    } else {
        return res.redirect("/logout")
    }
});

router.get("/addFriend:id", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    let them;

    if (token) {
        them = req.params.id.split("&")
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        FriendsDAO.areTheyFriends(parseInt(them[0]), parseInt(them[1]))
            .then(r => {
                r ? res.redirect("people") : FriendsDAO.addFriend(parseInt(them[0]), parseInt(them[1])).then(r => res.redirect("/people"))
            })

    } else {
        return res.redirect("/logout")
    }
})

//end-region

//messages-region

router.get("/messages", async (req, res) => {
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
        const usersfriends = await FriendsDAO.getUsersFriendsById(current_id)
        const users = await UsersDAO.getActualUsers(current_id)
        return res.render('messages', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            usersfriends: usersfriends.rows,
            users: users,
            current_chat: '',
            current_chat_with: ''
        });
    } else {
        return res.redirect("/logout")
    }
});

router.get("/openChat:id", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    let them;
    let current_chat = '';
    let current_chat_with = '';
    if (token) {
        them = req.params.id.split("&")
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        const usersfriends = await FriendsDAO.getUsersFriendsById(current_id)
        const users = await UsersDAO.getActualUsers(current_id)
        await MessagesDAO.messagesOf(parseInt(them[0]), parseInt(them[1])).then(value => {
            if (value.rows.length > 0) {
                current_chat = value.rows
            } else {
                current_chat = []
            }


        })
        await UsersDAO.getUsersById(parseInt(them[0])).then(value1 => {
            current_chat_with = value1.rows[0]
        })
        return res.render('messages', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            usersfriends: usersfriends.rows,
            users: users,
            current_chat: current_chat,
            current_chat_with: current_chat_with
        });


    } else {
        return res.redirect("/logout")
    }
})

router.post("/sendMessage:id", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    let them;
    let current_chat = '';
    let current_chat_with = '';
    if (token) {
        let textMessage = req.body.message
        if (textMessage.trim() !== "") {
            them = req.params.id.split("&")
            jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
                current_name = decodedToken.name;
                current_birthday = decodedToken.birthday;
                current_role = decodedToken.role;
                current_id = decodedToken.id;
                current_status = decodedToken.status;
            });
            const usersfriends = await FriendsDAO.getUsersFriendsById(current_id)
            const users = await UsersDAO.getActualUsers(current_id)
            await MessagesDAO.messagesOf(parseInt(them[0]), parseInt(them[1])).then(value => {
                if (value.rows.length > 0) {
                    current_chat = value.rows
                } else {
                    current_chat = []
                }
            })
            await UsersDAO.getUsersById(parseInt(them[0])).then(value1 => {
                current_chat_with = value1.rows[0]
            })
            MessagesDAO.addMessage(parseInt(them[1]), parseInt(them[0]), textMessage, new Date()).then(async _ => {
                await MessagesDAO.messagesOf(parseInt(them[0]), parseInt(them[1])).then(value => {
                    if (value.rows.length > 0) {
                        current_chat = value.rows
                    }
                })
                return res.render('messages', {
                    current_name: current_name,
                    current_role: current_role,
                    current_id: current_id,
                    current_birthday: current_birthday,
                    current_status: current_status,
                    usersfriends: usersfriends.rows,
                    users: users,
                    current_chat: current_chat,
                    current_chat_with: current_chat_with
                });
            })
        } else {
            res.redirect("/openChat" + req.params.id)
        }

    } else {
        return res.redirect("/logout")
    }
})

//end-region

//notifications-region
router.get("/notifications", async (req, res) => {
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
        const notifs = await NotificationsDAO.getNotifacationsOfUser(current_id);

        return res.render('notifications', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            notifs: notifs
        });
    } else {
        return res.redirect("/logout")
    }
});

router.post("/deleteNotif:id", async (req, res) => {
    let id = req.params.id;
    const token = req.cookies.jwt;
    if (token) {
        await NotificationsDAO.deleteNotification(id);
        return res.redirect('/notifications');
    } else {
        return res.redirect("/logout")
    }

});


//end-region

//image-region
router.post("/uploadPic", upload.single("image"), async (req, res) => {
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
            let pics = await getOwnPictures(current_id)

            if (!req.file) {
                return res.render('pictures', {
                    current_name: current_name,
                    current_role: current_role,
                    current_id: current_id,
                    current_birthday: current_birthday,
                    current_status: current_status,
                    pictures: pics,
                    images: [],
                    picHiba: 'Válassz ki képet'
                });
            }
            let picName = req.file.filename;


            await PicturesDAO.createPicture(current_id, null, picName);
            return res.redirect('/pictures');
        } else {
            return res.redirect("/logout")
        }

    }
);

//end-region
router.get("/pictures", async (req, res) => {
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
        let pics = await getOwnPictures(current_id)
        console.log(pics);
        return res.render('pictures', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            pictures: pics,
            images: [],
            picHiba: null
        });
    } else {
        return res.redirect("/logout")
    }
});


router.get("/albumCreate", async (req, res) => {
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
        let pics = await getOwnPictures(current_id)
        //console.log(pics);
        return res.render('albumCreate', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            pictures: pics
        });
    } else {
        return res.redirect("/logout")
    }
});

router.get("/albums", async (req, res) => {
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
        let albums = await PicturesDAO.getOwnAlbums(current_id)
        return res.render('albums', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            albums: albums,
            selectedAlbum: null,
            albumId: null
        });
    } else {
        return res.redirect("/logout")
    }


});

router.get("/albums:id", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    let id = req.params.id;

    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        let pics = await PicturesDAO.getAlbumPicsById(id);
        console.log(pics);
        let albums = await PicturesDAO.getOwnAlbums(current_id)
        return res.render('albums', {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            albums: albums,
            selectedAlbum: pics.rows,
            albumId: id
        });
    } else {
        return res.redirect("/logout")
    }


});


router.post("/createAlbum", async (req, res) => {
    const token = req.cookies.jwt;
    let current_id;
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_id = decodedToken.id;
        });
        const {albumName, selectedPictures} = req.body;
        await PicturesDAO.createAlbum(current_id, albumName);

        const albumId = await PicturesDAO.getLatestAlbumGenerate();

        if (selectedPictures && selectedPictures.length > 0) {
            for (const picId of selectedPictures) {
                await PicturesDAO.addPicToAlbum(picId, albumId.rows[0][0]);
            }
        }
        return res.redirect('/albums');
    } else {
        return res.redirect("/logout")
    }
});

router.post("/deleteAlbum:id", async (req, res) => {
    const token = req.cookies.jwt;
    let id = req.params.id;
    if (token) {
       await PicturesDAO.deleteAlbum(id);
        return res.redirect('/albums');
    } else {
        return res.redirect("/logout")
    }
});

router.post("/albumPicRemove:id", async (req, res) => {
    const token = req.cookies.jwt;
    let nameId;
    if (token) {
        nameId  = req.params.id.split("&");
            console.log(nameId);
        await PicturesDAO.albumPicRemove(parseInt(nameId[0]), parseInt(nameId[1]));
        return res.redirect('/albums');
    } else {
        return res.redirect("/logout")
    }
});


//split-image-region


//end-region

//members-region
router.post("/membersAll", async (req, res) => {
    const token = req.cookies.jwt;
    let currentGroupId = req.body.groupId
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
        let members = await GroupsDAO.getMembersOfGroup(currentGroupId)
        //console.log(currentGroupId)
        //console.log(members)
        let isUserOwner = await GroupsDAO.isUserOwnerInGroup(currentGroupId, current_id)
        return res.render("members", {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            members, isUserOwner, currentGroupId
        });

    } else {
        return res.redirect('/logout')
    }

})
router.post("/removeFromGroup", async (req, res) => {
    const token = req.cookies.jwt;
    let groupFrom = req.body.groupFrom
    let userToDel = req.body.userToDel
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
        await GroupsDAO.removeMemberFromGroup(groupFrom, userToDel)
        let members = await GroupsDAO.getMembersOfGroup(groupFrom)
        let isUserOwner = await GroupsDAO.isUserOwnerInGroup(groupFrom, current_id)
        return res.render("members", {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            groupFrom, members, isUserOwner
        });
    } else {
        return res.redirect('/logout')
    }

})
//end-region

//friends-region

router.get("/friends", async (req, res) => {
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
        let friends = await FriendsDAO.getUsersFriendsById(current_id)
        friends = friends.rows

        return res.render("friends", {
            current_name: current_name,
            current_role: current_role,
            current_id: current_id,
            current_birthday: current_birthday,
            current_status: current_status,
            friends

        });

    } else {
        return res.redirect('/logout')
    }
})

router.post("/block", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    let friendId = req.body.friendId
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        await FriendsDAO.blockFriend(current_id, friendId)
        return res.redirect('/friends')
    } else {
        return res.redirect('/logout')
    }
})

router.post("/unblock", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    let friendId = req.body.friendId
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        await FriendsDAO.unblockFriend(current_id, friendId)
        return res.redirect('/friends')
    } else {
        return res.redirect('/logout')
    }
})

router.post("/removeFriend", async (req, res) => {
    const token = req.cookies.jwt;
    let current_name;
    let current_birthday;
    let current_role;
    let current_status;
    let current_id;
    let friendId = req.body.friendId
    if (token) {
        jwt.verify(token, jwtSecret.jwtSecret, (err, decodedToken) => {
            current_name = decodedToken.name;
            current_birthday = decodedToken.birthday;
            current_role = decodedToken.role;
            current_id = decodedToken.id;
            current_status = decodedToken.status;
        });
        await FriendsDAO.deleteFriendOf(current_id, friendId)
        return res.redirect('/friends')
    } else {
        return res.redirect('/logout')
    }
})


//end-region

module.exports = router;