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

const urlBase = `https://test-api-isicampus.herokuapp.com`;
const version = "1.0";

app.set('view engine', 'ejs');
app.set('views', 'template/code');

app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
  })

app.get("/", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}login`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/register", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}registo`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/recover", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}recuperar`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/recoverPass/:id", (request, response) => {
    const user_id = request.sanitize("id").escape();
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}alterarPass`, {
        urlBase: urlBase,
        ver: version,
        user_id: user_id
    });
})

app.get("/purchase", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}comprarBilhete`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/purchase/historic", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}historicoCompras`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/profile", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}perfil`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/tickets/unused", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}bilhetesNaoUtilizados`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/qrcodes/:id", (request, response) => {
    const qrcode_id = request.sanitize("id").escape();
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}qrcode`, {
        urlBase: urlBase,
        ver: version,
        qrcode_id: qrcode_id
    });
})

app.get("/tickets/used", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}bilhetesUtilizados`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/bus", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}horarios`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/qrcode/reader", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}validacaoBilhete`, {
        urlBase: urlBase,
        ver: version
    });
})

app.get("/offlinepage", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}offlinepage`, {
        urlBase: urlBase,
        ver: version
    });
})

app.listen(process.env.PORT, () => console.log(`Node server listening on port ${process.env.PORT}!`));