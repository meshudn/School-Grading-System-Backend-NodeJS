/*
* API /Subjects
* Subjects Add, Remove, Update
* */
const express = require("express");
const router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoDbUrl = "mongodb://localhost:27017/";
const collectionSubjects = "subjects";
const collectionClass = "classes";

router.get("/", (request, response) => {
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query = {
            archived: "false"
        };
        dbo.collection(collectionSubjects).find(query).toArray(function (err, res) {
            if (err) throw err;
            //console.log(res);
            if (res.matchedCount == 1) {
                response.status(200);
                response.send("");
            } else {
                response.status(204);
                response.send("");
            }
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
        query = {
            subjectName: user_query,
            archived: "false"
        };
        if (query) {
            dbo.collection(collectionSubjects).find(query).toArray(function (err, res) {
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

    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection = {
            subjectId:  "s" + Date.now() + Math.floor(Math.random() * 1000),
            subjectName: object.subjectName,
            className: object.className,
            teacher: object.teacher,
            archived: "false"
        };
        dbo.collection(collectionSubjects).insertOne(collection, function (err, res) {
            if (err) throw err;
            console.log("One subject inserted");
            response.status(201);
            response.send("/subjects/" + collection.subjectId);
            db.close();
        });
    });
});

router.put("/:id", (request, response) => {
    let subjecid;
    try {
        subjecid = request.params.id;
    } catch (e) {
        subjecid = "";
        response.status(400);
    }
    const object = request.body;
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection;
        if (object.subjectName && object.className && object.teacher && object.archived) {
            collection = {
                $set: {
                    className: object.className,
                    subjectName: object.subjectName,
                    teacher: object.teacher,
                    archived: object.archived,
                }
            };
        } else {
            response.status(400);
            response.send();
        }
        var query = {
            className: subjecid
        };

        dbo.collection(collectionSubjects).updateOne(query, collection, function (err, res) {
            if (err) throw err;
            console.log("One subject updated");
            if (res.matchedCount == 1) {
                response.status(200);
                response.send("");
            } else {
                response.status(404);
                response.send("");
            }

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
            className: user_query
        };
        if (user_query) {
            dbo.collection(collectionSubjects).deleteOne(query, function (err, res) {
                if (err) {
                    throw err;
                }
                console.log("One class deleted: " + res);
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
            response.send("Class Name is not matched or class Name format is not correct.");
        }

    });
});

module.exports = router;
