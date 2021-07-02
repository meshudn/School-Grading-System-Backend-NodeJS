/*
* API /Users
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
                userId: parseInt(user_query)
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
                userId: Date.now() + Math.floor(Math.random() * 1000),
                username: object.username,
                password: hash,
                firstName: object.firstName,
                lastName: object.lastName,
                role: object.role,
                archived: "false"
            };
            dbo.collection("users").insertOne(collection, function (err, res) {
                if (err) throw err;
                console.log("One user inserted");
                response.status(201);
                response.send("/users/" + collection.userId);
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

            if (res) {
                userPassword = res.password;
                console.log("userpass: " + userPassword);

                bcrypt.compare(object.password, userPassword, function (err, hashRes) {
                    if (hashRes == true) {
                        console.log("login successful");
                        response.status(200);
                        response.send("");
                    } else {
                        response.status(401);
                        response.send("");
                    }
                });
            } else {
                response.status(401);
                response.send("Username or Password not matched.");
            }

            db.close();
        });
    });
});

router.put("/:id", (request, response) => {
    let user_id;
    try {
        user_id = request.params.id;
    } catch (e) {
        user_id = "";
        response.status(400);
    }
    const object = request.body;
    console.log("request data: " + object.firstName);

    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection;
        if (object.username && object.password && object.firstName && object.lastName && object.role) {
            collection = {
                $set: {
                    username: object.username,
                    password: object.password,
                    firstName: object.firstName,
                    lastName: object.lastName,
                    role: object.role
                }
            };
        } else if (object.username && object.firstName && object.lastName && object.role) {
            collection = {
                $set: {
                    username: object.username,
                    firstName: object.firstName,
                    lastName: object.lastName,
                    role: object.role
                }
            };
        } else if (object.username && object.password && object.firstName && object.lastName) {
            collection = {
                $set: {
                    username: object.username,
                    password: object.password,
                    firstName: object.firstName,
                    lastName: object.lastName,
                }
            };
        } else if (object.username && object.password && object.firstName) {
            collection = {
                $set: {
                    username: object.username,
                    password: object.password,
                    firstName: object.firstName,
                }
            };
        } else if (object.username && object.password && object.lastName) {
            collection = {
                $set: {
                    username: object.username,
                    password: object.password,
                    lastName: object.lastName,
                }
            };
        } else if (object.username && object.password) {
            collection = {
                $set: {
                    username: object.username,
                    password: object.password,
                }
            };
        } else if (object.username && object.firstName) {
            collection = {
                $set: {
                    username: object.username,
                    firstName: object.firstName,
                }
            };
        } else if (object.username && object.lastName) {
            collection = {
                $set: {
                    username: object.username,
                    lastName: object.lastName,
                }
            };
        } else if (object.username && object.role) {
            collection = {
                $set: {
                    username: object.username,
                    role: object.role,
                }
            };
        } else if (object.password) {
            collection = {
                $set: {
                    password: object.password,
                }
            };

        } else if (object.firstName) {
            collection = {
                $set: {
                    firstName: object.firstName,
                }
            };
        } else if (object.lastName) {
            collection = {
                $set: {
                    lastName: object.lastName,
                }
            };
        } else if (object.username) {
            collection = {
                $set: {
                    username: object.username,
                }
            };
        } else if (object.role) {
            collection = {
                $set: {
                    role: object.role,
                }
            };
        } else {
            response.status(400);
            response.send();
        }
        var query = {
            userId: parseInt(user_id)
        };


        /*
        * if password changing has been requested
        * then storing data after hashing password
        * or normal storing mechanism to mongodb
        * */
        if(object.password){
            /*
            * updating new password
            * password hashing before storing
            * */
            console.log("collection: "+ collection);
            bcrypt.hash(object.password, saltRound, (err, hash) => {
                collection.$set.password = hash;
                dbo.collection("users").updateOne(query, collection, function (err, res) {
                    if (err) throw err;
                    console.log("password updated");
                    response.status(200);
                    response.send();
                    db.close();
                });
            });
        }else{
            dbo.collection("users").updateOne(query,collection, function (err, res) {
                if (err) throw err;
                console.log("One user updated");
                if (res.matchedCount == 1) {
                    response.status(200);
                    response.send("");
                } else {
                    response.status(404);
                    response.send("");
                }

                db.close();
            });
        }
        /* ... mongodb saving completed ... */
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
            userId: parseInt(user_query)
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
