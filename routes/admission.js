/*
* API /admission
* Admission Add, Remove, Update
* */
const express = require("express");
const router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoDbUrl = "mongodb://localhost:27017/";
const collectionClass = "admission";
const collectionUsers = "users";

router.get("/", (request, response) => {
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query = {
            archived: "false"
        };
        dbo.collection(collectionClass).find(query).toArray(function (err, res) {
            if (err) throw err;
            //console.log(res);
            response.status(200);
            response.send(res);
            db.close();
        });
    });
});
router.get("/search", (request, response) => {
    let query_classId, query_studentId;

    try {
        query_classId = request.query.classId;
        query_studentId = request.query.studentId;
    } catch (e) {
        user_query = "";
    }
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query;
        query = {
          classId: query_classId
        };
        if(query_studentId){
            query.studentId = query_studentId;
        }

        if (query) {
            dbo.collection(collectionClass).find(query).toArray(function (err, res) {
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
            admissionId: "a" + Date.now() + Math.floor(Math.random() * 1000),
            classId: object.classId,
            studentId: object.studentId,
            archived: "false"
        };
        dbo.collection(collectionClass).insertOne(collection, function (err, res) {
            if (err) throw err;
            console.log("One class inserted");
            response.status(201);
            response.send("/classes/" + collection.className);
            db.close();
        });
    });
});

router.put("/:id", (request, response) => {
    let classid;
    try {
        classid = request.params.id;
    } catch (e) {
        classid = "";
        response.status(400);
    }
    const object = request.body;
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection;
        if (object.className) {
            collection = {
                $set: {
                    className: object.className,
                }
            };
        }
        if(object.studentId){
            collection = {
                $set: {
                    className: object.className,
                }
            };
        }
        if(object.studentId && object.classId && object.studentId && object.archived){
            collection = {
                $set: {
                    studentId: object.studentId,
                    classId: object.classId,
                    archived: object.archived,
                }
            };
        }
        var query = {
            admissionId: classid
        };

        dbo.collection(collectionClass).updateOne(query, collection, function (err, res) {
            if (err) throw err;
            console.log("One class updated");
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
        var query;
        if(user_query.charAt(0) === "u"){
            query = {
                studentId: user_query
            };
        }else if(user_query.charAt(0) === "c"){
            query = {
                classId: user_query
            };
        }else if(user_query.charAt(0) === "a"){
            query = {
                admissionId: user_query
            };
        }

        if (user_query) {
            dbo.collection(collectionClass).deleteOne(query, function (err, res) {
                if (err) {
                    throw err;
                }
                console.log("One class deleted: " );
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
            response.send("format not correct");
        }
    });
});

module.exports = router;
