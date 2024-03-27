const Pool = require("pg").Pool;

const dbConfig = new Pool({
    host     : 'localhost',
    user     : 'root',
    database : 'moodletest',
    port: 5432,
    ssl: false
});

module.exports=dbConfig;

