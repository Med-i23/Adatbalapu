const mysql = require('mysql2/promise');

class UsersDAO {
    async createUsers(name, username, password){
        const connection = await mysql.createConnection({host:'localhost',user:'root',database:'moodletest'})
        await connection.query('INSERT INTO user (name, username, password) VALUES (?, ?, ?)', [name, username, password])
        connection.end();
        return;
    }


    async deleteUser(id){
        const connection = await mysql.createConnection({host:'localhost',user:'root',database:'moodletest'})
        await connection.query('DELETE FROM user WHERE id=?', [id])
        connection.end();
        return;
    }
    async getUsers(){
        const connection = await mysql.createConnection({host:'localhost',user:'root',database:'moodletest'})
        const [result, query]= await connection.execute('SELECT * FROM user');
        connection.end();
        return result;
    }
    async getUsersById(id) {
        const connection = await mysql.createConnection({host:'localhost',user:'root',database:'moodletest'});
        const query= await connection.execute('SELECT * FROM user WHERE id=? ', [id]);
        connection.end();
        return query[0][0];
    };

    async getUsersByUserName(username) {
        const connection = await mysql.createConnection({host:'localhost',user:'root',database:'moodletest'});
        const query= await connection.execute('SELECT * FROM user WHERE username = ? ', [username]);
        connection.end();
        return query[0][0];
    };

    async modifyUserRole(id, role) {
        const connection = await mysql.createConnection({host:'localhost',user:'root',database:'moodletest'});
        await connection.query('UPDATE user SET role=? WHERE id = ?', [role, id]);
        connection.end();
        return;
    };


    async changeUserLoggedin(username) {
        const connection = await mysql.createConnection({host:'localhost',user:'root',database:'moodletest'});
        await connection.query('UPDATE user SET loggedin=!loggedin WHERE username=?', [username]);
        connection.end();
        return;
    };

}

module.exports = UsersDAO;