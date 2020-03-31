require('dotenv').config();

const express = require("express");
const app = express();

const dirName = __dirname + '/template/code/';
app.use(express.static(dirName));

app.set('view engine', 'ejs');
app.set('views', dirName);

app.get("/", (request, response) => {
    /*response.set('Content-Type', 'text/html');
    response.render(`${dirName}login`);*/
    response.send("OLA");
})

app.get("/register", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}registo`);
})

app.get("/recover", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}recuperar`);
})

app.get("/purchase", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}comprarBilhete`);
})

app.get("/profile", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}perfil`);
})

app.get("/unusedTickets", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}bilhetesNaoUtilizados`);    
})

app.get("/usedTickets", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}bilhetesUtilizados`);    
})

app.get("/busSchedules", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}horarios`);    
})

app.listen(process.env.PORT, () => console.log(`Node server listening on port ${process.env.PORT}!`));