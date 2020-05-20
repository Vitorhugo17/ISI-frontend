require('dotenv').config();

const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const validator = require('express-validator');
const sanitizer = require('express-sanitizer');

app.use(bodyParser.json({
    limit: '50mb'
}), bodyParser.urlencoded({
    extended: true
}));
app.use(sanitizer());
app.use(validator());

const dirName = __dirname + '/template/code/';
app.use(express.static(dirName));

const urlBase = `http://localhost:8080`;

app.set('view engine', 'ejs');
app.set('views', 'template/code');

app.get("/", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}login`, {
        urlBase: urlBase
    });
})

app.get("/register", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}registo`, {
        urlBase: urlBase
    });
})

app.get("/recover", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}recuperar`, {
        urlBase: urlBase
    });
})

app.get("/recoverPass/:id", (request, response) => {
    const user_id = request.sanitize("id").escape();
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}alterarPass`, {
        urlBase: urlBase,
        user_id: user_id
    });
})

app.get("/purchase", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}comprarBilhete`, {
        urlBase: urlBase
    });
})

app.get("/purchaseHistoric", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}historicoCompras`, {
        urlBase: urlBase
    });
})

app.get("/profile", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}perfil`, {
        urlBase: urlBase
    });
})

app.get("/ticketsUnused", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}bilhetesNaoUtilizados`, {
        urlBase: urlBase
    });
})

app.get("/qrcodes_:id", (request, response) => {
    const qrcode_id = request.sanitize("id").escape();
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}qrcode`, {
        urlBase: urlBase,
        qrcode_id: qrcode_id
    });
})

app.get("/ticketsUsed", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}bilhetesUtilizados`, {
        urlBase: urlBase
    });
})

app.get("/bus", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}horarios`, {
        urlBase: urlBase
    });
})

app.get("/qrcodeReader", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}validacaoBilhete`, {
        urlBase: urlBase
    });
})

app.listen(process.env.PORT, () => console.log(`Node server listening on port ${process.env.PORT}!`));