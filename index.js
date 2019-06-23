const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const path = require('path');
var R = require("r-script");

app.use(express.static(path.join(__dirname, '/public/')));
app.use(express.static(path.join(__dirname, '/data/')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/underscore')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/d3')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'))
});

app.get('/data/year=:year&parent=:parent', (req, res) => {
    // res.send({a: 2, b: 4})
    let year = req.params["year"];
    let genre = req.params["parent"];

    // console.log(__filename)
    try{
        var spawn = require("child_process").spawn;
        var process = spawn('python', ["./test.py",
            year, genre
        ]);
    }
    catch(e){
        console.log(e);
        res.send({error: e.message});
    }
    process.stdout.on("data", function (data) {
        // console.log(data.toString());
        try{
            console.log(data.toString());
            res.send(JSON.parse(data));
        }
        catch(e){
            console.log(e)
            res.send({error: e.message})
        }
    });
    // console.log(out);
    
    // R("script.R")
    //     .data({genre: genre})
    //     .call(function(err, d){
    //         console.log('d')
    //     })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))