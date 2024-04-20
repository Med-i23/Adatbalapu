const query = require("./common.js").query;
let format = "yyyy-mm-dd"

exports.getGroups = async () => {
    return await query('SELECT * FROM CSOPORT');
};
