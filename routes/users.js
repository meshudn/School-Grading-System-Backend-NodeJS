/*
* API /User
* User Add, Remove, Update
* */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRound = 10;
var MongoClient = require('mongodb').MongoClient;
var mongoDbUrl = "mongodb://localhost:27017/";

router.get("/", (request, response) => {
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query = {
            archived: "false"
        };
        dbo.collection("users").find(query).toArray(function (err, res) {
            if (err) throw err;
            //console.log(res);
            response.status(200);
            response.send(res);
            db.close();
        });
    });
});
router.get("/:id", (request, response) => {
    let user_query;

    try {
        user_query = request.params.id;
    } catch (e) {
        user_query = "";
        response.status(400);
    }
    console.log("id: " + user_query);
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query;
        if (user_query == "teacher" || user_query == "student" || user_query == "admin") {
            query = {
                role: user_query
            }
            //console.log("user format checked");
        } else if (user_query % 2 == 0 || user_query % 2 != 0) {
            query = {
                userid: parseInt(user_query)
            }
            //console.log("number format checked");
        } else {
            console.log("bad request checked");
            response.status(400);
            response.send("");
            query = 0;
        }
        if (query) {
            dbo.collection("users").find(query).toArray(function (err, res) {
                if (err) throw err;
                //console.log(res);

                if (res.length > 0) {
                    response.status(200);
                    response.send(res);
                } else {
                    response.status(404);
                    response.send("");
                }
                db.close();
            });
        }
    });
});
router.post("/", (request, response) => {
    const object = request.body;
    console.log("request data: " + request.body);

    bcrypt.hash(object.password, saltRound, (err, hash) => {
        MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
            if (err) throw err;
            var dbo = db.db("school_grading_system");
            var collection = {
                userid: Date.now() + Math.floor(Math.random() * 1000),
                username: object.username,
                password: hash,
                firstname: object.firstname,
                lastname: object.lastname,
                role: "teacher",
                archived: "false"
            };
            dbo.collection("users").insertOne(collection, function (err, res) {
                if (err) throw err;
                console.log("One user inserted");
                response.status(201);
                response.send("/users/" + collection.userid);
                db.close();
            });
        });
    });
});
/*
* User login
* */
router.post("/login", (request, response) => {
    const object = request.body;
    console.log("request data: " + request.body);
    var userPassword;
    /*
    * Getting user stored password from the database
    * */
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query = {username: object.username};
        dbo.collection("users").findOne(query, function (err, res) {
            if (err) throw err;
            //console.log(res);

            if(res){
                userPassword = res.password;
                console.log("userpass: " + userPassword);
                response.status(200);
                response.send(res);

                bcrypt.compare("mishty12", userPassword, function(err, hashRes) {
                    if(hashRes == true){
                        console.log("login successful");
                    }else{
                        console.log("login failed");
                    }
                });
            }else{
                response.status(401);
                response.send("");
            }

            db.close();
        });
    });
});

router.put("/", (request, response) => {
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection = {
            $set: {
                username: "user1",
                password: "sss",
                forename: "Nafisa",
                surname: "Mishty",
                role: "teacher"
            }
        };
        var query = {
            userid: "1625172787598"
        };
        dbo.collection("users").updateOne(query, collection, function (err, res) {
            if (err) throw err;
            console.log("One user updated");
            response.status(200);
            response.send(collection);
            db.close();
        });
    });
});
router.delete("/:id", (request, response) => {
    let user_query;

    try {
        user_query = request.params.id;
    } catch (e) {
        user_query = "";
        response.status(400);
    }
    console.log("id: " + user_query);
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query = {
            userid: parseInt(user_query)
        };
        if (user_query % 2 == 0 || user_query % 2 != 0) {
            dbo.collection("users").deleteOne(query, function (err, res) {
                if (err) {
                    throw err;
                }
                console.log("One user deleted: " + res);
                if (res.deletedCount == 1) {
                    response.status(200);
                    response.send("Successfully deleted!");
                } else {
                    response.status(404);
                    response.send("");
                }
                db.close();
            });
        } else {
            response.status(400);
            response.send("Id is not matched or Id format is not correct.");
        }

    });
});

module.exports = router;
