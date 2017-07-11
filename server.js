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
    password: 'root',
    database: 'apiios',
    port: '8889'
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
    connection.query("SELECT * FROM post ORDER BY date", function (error, results_list, fields) {
        if (error) {
            res.status(400).send({
                "message": "Nous n'arrivons pas à récupérer la liste des taches."
            });
        } else {
            if (results_list.length) {
                var data = [];
                async.eachSeries(results_list, function(item, callback){
                    if (item.id !== null) {
                        data.push(item);
                    }
                    callback(null)
                }, function done(){
                    res.status(200).send({
                        "data": data
                    })
                });
            } else {
                res.status(204).send({
                    "message": "Il n'y à aucune taches dans notre base de donnée."
                })
            }
        }
    });
});

app.post('/post', function (req, res) {
    const post = {
        'title': req.body.tile,
        'content': req.body.content,
        'date': req.body.date,
    };

    connection.query('INSERT INTO post SET ?', post, function (error, results, fields) {
        if (error) {
            console.log("Erreur : ", error);
            res,status(400).send({
                "message": "Une erreure s'est produite lors de l'envoie de la nouvelle tache."
            })
        } else {
            res,status(200).send({
                "success": "La tache à bien été ajouté."
            });
        }
    });

});

app.get('/edit', function (req, res) {
    const id = {
        'id' : req.query.id
    };
    const users = {
        'title': req.query.title,
        'content': req.query.content,
        'date': req.query.date,
    };

    connection.query('UPDATE post SET ? WHERE ?', [users, id], function (error, results, fields) {
        if (error) {
            console.log("Erreur : ", error);
            res.status(400).send({
                "message": "Quelque chose s'est mal passé dans l'édition de la tache."
            })
        } else {
            res.status(200).send({
                "message": "La tache à bien été édité."
            });
        }
    });
});

app.get('/delete', function (req, res) {
    const id = {
        'id' : parseInt(req.query.id)
    };

    connection.query('DELETE FROM post WHERE id = ?', [id.id], function (error, results, fields) {
        if (error) {
            res.status(400).send({
                "message": "La tache n'a pas été supprimé suite à une erreur interne."
            })
        } else {
            res.status(200).send({
                "message": "La tache à bien été supprimé."
            });
        }
    });
});

app.listen(56789, function () {
    console.log("Go to 0.0.0.0:56789");
});