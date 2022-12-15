const express = require ('express')
var path = require('path');

const app = express();
const port = process.env.PORT || 3000

app.use(express.static(__dirname + "/public"));

app.get( '/' ,(req, res) => {
    var options = {
        root: path.join(__dirname)
    };
    var fileName = 'index.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
    })

app.listen( port ,
    () => console.log(`Server started on Port ${ port } :) Ctrl + C to Stop `));