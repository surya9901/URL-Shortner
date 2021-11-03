const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotnev = require('dotenv');
dotnev.config();

mongoose.connect(`${process.env.DB_URL}`);

const { UrlModel } = require('./models/urlshort')

// Middleware
app.use(express.static('public'));

// using ejs to generate HTML with plain js 
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    // render will search for a file under the name 
    // home.ejs or what ever given in the render method
    // in a folder called views.
    let allUrl = UrlModel.find((err, result) => {
        res.render('home', {
            urlResult: result
        })
    })
});

app.post('/create', (req, res) => {
    // Create short URL
    let urlShort = new UrlModel({
        longUrl: req.body.longurl,
        shortUrl: generateUrl()
    })

    // store it in DB
    urlShort.save((err, data) => {
        if (err) throw err;
        res.redirect('/');
    })
});

app.get('/redirect/:urlId', (req, res) => {
    let urlShort = UrlModel.findOne({ shortUrl: req.params.urlId }, (err, data) => {
        if (err) throw err;

        UrlModel.findByIdAndUpdate({ _id: data.id }, { $inc: { clickCount: 1 } }, (err, updatedData) => {
            if (err) throw err
            res.redirect(data.longUrl)
        })
    })
})

app.get('/delete/:id',(req,res)=>{
    UrlModel.findByIdAndDelete({_id:req.params.id},(err,deleteData)=>{
        if (err) throw err;
        res.redirect('/')
    })
})

app.listen(PORT, () => {
    console.log(`This app is listening to port ${PORT}`)
});

function generateUrl() {
    var ranResult = "";
    var character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var characterLength = character.length;

    for (let i = 0; i < 5; i++) {
        ranResult += character.charAt(
            Math.floor(Math.random() * characterLength)
        );
    }
    return ranResult
}