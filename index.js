const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
const db_config = require("./config/db_conf.js")
const app = express();
const routeUser = require('./routes/routes');
const PORT = process.env.PORT || 8080;
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "sources")));
app.use(express.urlencoded({ extended: false }));
app.use(routeUser);
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/@popperjs/core/dist/umd')));

async function init(){
    await oracledb.createPool(db_config)
}

app.listen(PORT, () => {
    console.log("Start successfull! http://localhost:8080");
    console.log(__dirname)
});