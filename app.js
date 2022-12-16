const express = require ('express')
const cors = require('cors'); 
var path = require('path');


require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 3000

app.use(express.static(__dirname + "/public"));


//Routes
app.use('/api', require('./routes'))


//enable cors 
app.use(cors())


app.listen( port ,
    () => console.log(`Server started on Port ${ port } :) Ctrl + C to Stop `));