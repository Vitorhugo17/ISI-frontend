const express = require("express");
const app = express();

const dirName = __dirname + '/template/code/';
app.use(express.static(dirName));

app.set('view engine', 'ejs');
app.set('views', 'template/code');

app.get("/profile", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}perfil`);
})

app.get("/", (request, response) => {
    response.set('Content-Type', 'text/html');
    response.render(`${dirName}index`);    
})

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));