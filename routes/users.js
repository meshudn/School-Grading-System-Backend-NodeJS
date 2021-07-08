/*
* API /Users
* User Add, Remove, Update
* */
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRound = 10;
var MongoClient = require('mongodb').MongoClient;
var mongoDbUrl = "mongodb://localhost:27017/";
router.use(bodyParser.json());

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
router.get("/search", (request, response) => {
    let query_role, query_id;
    try {
        query_role = request.query.role;
        query_id = request.query.id;

        console.log("role: " + query_role);
        console.log("id: " + query_id);
    } catch (e) {
        query_role = "";
        query_id = "";
    }

    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query;
        if (query_role != "" && query_role) {
            query = {
                role: query_role
            }
        } else if (query_id != "" && query_id) {
            query = {
                userid: query_id
            }
        } else if (query_role && query_id) {
            query = {
                userid: query_id,
                role: query_role
            }
        } else {
            console.log("bad request checked");
            response.status(400);
            response.send("");
            query = 0;
        }
        if (query) {
            console.log(query);
            dbo.collection("users").find(query).toArray(function (err, res) {
                if (err) throw err;
                console.log(res);

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
                userid: "u" + Date.now() + Math.floor(Math.random() * 1000),
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
            if (res) {
                userPassword = res.password;
                bcrypt.compare(object.password, userPassword, function (err, hashRes) {
                    if (hashRes == true) {
                        console.log("login successful");
                        response.status(200);
                        response.send(res);
                    } else {
                        response.status(401);
                        response.send("");
                        console.log("login failed: " + hashRes);
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
    console.log("request password: " + object.password);

    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection;
        if (object.username && object.password && object.firstName && object.lastName && object.role && object.archived) {
            collection = {
                $set: {
                    username: object.username,
                    password: object.password,
                    firstName: object.firstName,
                    lastName: object.lastName,
                    role: object.role,
                    archived: object.archived
                }
            };
        } else if (object.username && object.firstName && object.lastName && object.role && object.archived) {
            collection = {
                $set: {
                    username: object.username,
                    firstName: object.firstName,
                    lastName: object.lastName,
                    role: object.role,
                    archived: object.archived
                }
            };
        } else {
            response.status(400);
            response.send();
        }
        var query = {
            userid: user_id
        };


        /*
        * if password changing has been requested
        * then storing data after hashing password
        * or normal storing mechanism to mongodb
        * */
        if (object.password) {
            /*
            * updating new password
            * password hashing before storing
            * */
            console.log("collection: " + collection);
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
        } else {
            dbo.collection("users").updateOne(query, collection, function (err, res) {
                if (err) throw err;
                console.log("One user updated");
                if (res.modifiedCount == 1) {
                    response.status(200);
                    response.send(res);
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
        //response.status(400);
    }
    console.log("id: " + user_query);
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        /*/!*
        * Special case Checking: Does this teacher has any subject or not
        * *!/
        var query = {teacherId: user_query};
        let isTeacherHasSubject = false;
        dbo.collection("subjects").findOne(query, function (err, res) {
            if (err) throw err;
            //console.log(res);
            if (res) {
                isTeacherHasSubject = true;
            } else {
                isTeacherHasSubject = false;
                response.status(204);
                response.send("Can not delete because teacher has atleast one subject.");
            }
            db.close();
        });
*/
        /*
        * special case: deleteing if teacher has no subject
        * */
        var query = {
            userid: user_query
        };
        if (query) {
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
        }
    });
});

module.exports = router;
