require('dotenv').config();

const express = require("express");
const app = express();

const dirName = __dirname + '/template/code/';
app.use(express.static(dirName));

app.set('view engine', 'ejs');
app.set('views', 'template/code');

app.get("/", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}login`);
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

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));