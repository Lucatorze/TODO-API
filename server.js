const mysql = require('mysql');
const sha1 = require('sha1');
const async = require('async');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const connection = mysql.createConnection({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'apiios',
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());



connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL");
});

app.get('/getTodo', function (req, res) {
    connection.query("SELECT posts.id, user_id FROM posts ORDER BY date", function (error, results_post, fields) {
        if (error) {
            res.status(400).send({
                "message": "cannot get list"
            });
        } else {
            if (results_post.length) {
                var tab = [];
                async.eachSeries(results_post, function(item, callback){
                    if (item.id !== null) {
                        tab.push(item);
                    }
                    callback(null)
                }, function done(){
                    res.status(200).send({
                        "data": tab
                    })
                });
            } else {
                res.status(204).send({
                    "message": "there are no posts"
                })
            }
        }
    });
});

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname+'/public/login.html'));
});

app.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
        if (error) {
            res.status(400).send({
                "message": "Error occurred"
            })
        } else {
            if (results.length > 0) {
                if (results[0].password === password) {
                    res.status(200).send(results[0]);
                }
                else {
                    res.status(204).send({
                        "success": false,
                        "message": "Email and password does not match"
                    });
                }
            }
            else {
                res.status(204).send({
                    "success": false,
                    "message": "Email does not exits"
                });
            }
        }
    });

});

app.get('/edit', function (req, res) {
    const id = {
        'id' : req.query.id
    };
    const users = {
        'firstname': req.query.firstname,
        'lastname': req.query.lastname,
        'email': req.query.email,
        'password': req.query.password,
        'birthdate': req.query.birthdate
    };

    connection.query('UPDATE users SET ? WHERE ?', [users, id], function (error, results, fields) {
        if (error) {
            console.log("error occurred", error);
            res.status(400).send({
                "message": "error occurred"
            })
        } else {
            res.status(200).send({
                "message": "User edited"
            });
        }
    });
});

app.post('/post', function (req, res) {
    const post = {
        'user_id': req.body.user_id,
        'content': req.body.content,
        'date': req.body.date,
    };

    connection.query('INSERT INTO posts SET ?', post, function (error, results, fields) {
        if (error) {
            console.log("error occurred", error);
            res.send({
                "code": 400,
                "failed": "error occurred"
            })
        } else {
            res.send({
                "code": 200,
                "success": "Posts created"
            });
        }
    });

});

app.listen(56789, function () {
    console.log("Go to 0.0.0.0:56789");
});