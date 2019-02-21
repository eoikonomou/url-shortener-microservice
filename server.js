'use strict';
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const dns = require('dns');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGOLAB_URI, { useMongoClient: true });
var short_url = 0;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));

const urlSchema = new Schema({ original_url: { type: String, required: true, unique: true }, short_url: { type: Number, required: true, unique: true } });
const URL = mongoose.model('URL', urlSchema);

// Routes
app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});
app.get("/api/hello", function (req, res) {
    res.json({ greeting: 'hello API' });
});
app.post('/api/shorturl/:option', (req, res) => {
    try {
        let option = req.params.option;
        let url = req.body.url;
        if (option === 'new') {
            dns.lookup(url, function (err, address) {
                if (err) {
                    res.json({ error: 'invalid URL' });
                } else {
                    short_url++;
                    let newUrl = new URL({ original_url: url, short_url });
                    console.log('adding url');
                    newUrl.save().then(data => {
                        console.log('added url');
                        res.json({ original_url: data.original_url, short_url: data.short_url });
                    }).catch(err => res.json({ error: 'Error adding url' }));
                }
            });
        } else {
            URL.findOne({ short_url: option }).then(data => {
                console.log(data);
                res.json({ original_url: data.original_url, short_url: data.short_url });
            }).catch(err =>
                res.json({ error: 'url not found' }));
        }
    } catch (error) {
        console.log(error);
    }
});

app.listen(port, function () {
    console.log('Node.js listening ...');
});
