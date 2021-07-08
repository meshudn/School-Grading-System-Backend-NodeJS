/*
* API /tests
* Tests Add, Remove, Update
* */
const express = require("express");
const router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoDbUrl = "mongodb://localhost:27017/";
const collectionName = "tests";

router.get("/", (request, response) => {
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query = {
            archived: "false"
        };
        dbo.collection(collectionName).find(query).toArray(function (err, res) {
            if (err) throw err;
            //console.log(res);
            response.status(200);
            response.send(res);
            db.close();
        });
    });
});
router.get("/search", (request, response) => {
    let query_subject;
    try {
        query_subject = request.query.subjectId;
    } catch (e) {
        query_subject = "";
        //response.status(400);
    }
    console.log("subject query: " + query_subject);
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query;
        query = {
            subjectId: query_subject
        };
        if (query) {
            dbo.collection(collectionName).find(query).toArray(function (err, res) {
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

    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection = {
            testId:  "t" + Date.now() + Math.floor(Math.random() * 1000),
            testName: object.testName,
            testDate: object.testDate,
            subjectId: object.subjectId,
            classId: object.classId,
            subjectName: object.subjectName,
            teacherName: object.teacherName,
            teacherId: object.teacherId,
            archived: "false"
        };
        dbo.collection(collectionName).insertOne(collection, function (err, res) {
            if (err) throw err;
            console.log("One subject inserted");
            response.status(201);
            response.send("/tests/" + collection.testId);
            db.close();
        });
    });
});

router.put("/:id", (request, response) => {
    console.log("updating tests");
    let queryId;
    try {
        queryId = request.params.id;
    } catch (e) {
        queryId = "";
        response.status(400);
    }
    const object = request.body;
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection;
        if (object.subjectName && object.subjectId && object.classId && object.testName && object.testDate && object.teacherName && object.teacherId && object.archived) {
            collection = {
                $set: {
                    testName: object.testName,
                    testDate: object.testDate,
                    subjectId: object.subjectId,
                    classId: object.classId,
                    subjectName: object.subjectName,
                    teacher: object.teacher,
                    archived: object.archived,
                }
            };
        } else {
            response.status(400);
            response.send("Please provide all the information to update i.e: Name, Date, Subject, Teacher, archived");
        }
        var query = {
            testId: queryId
        };
        dbo.collection(collectionName).updateOne(query, collection, function (err, res) {
            if (err) throw err;
            console.log("One test updated");
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


router.put("/archived/id", (request, response) => {
    console.log("updating tests archived");
    let queryId_subject;
    try {
        queryId_subject = request.query.subjectId;
        console.log(queryId_subject);
    } catch (e) {
        queryId_subject = "";
        //response.status(400);
    }
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        let collection, query;
        if (queryId_subject) {
            collection = {
                $set: {
                    archived: "true"
                }
            };
            query = {
                subjectId: "" + queryId_subject
            };
            dbo.collection(collectionName).updateMany(query, collection, function (err, res) {
                if (err) throw err;
                console.log("One test updating");
                console.log(res);
                if (res.matchedCount) {
                    response.status(200);
                    response.send("");
                }
                db.close();
            });
        } else {
            response.status(400);
        }

    });
});

router.delete("/:id", (request, response) => {
    /*
    * id: testId of the test
    * */
    let user_query;
    try {
        user_query = request.params.id;
    } catch (e) {
        user_query = "";
        response.status(400);
    }
    console.log("test id for deletion: " + user_query);
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query = {
            testId: user_query
        };
        if (user_query) {
            dbo.collection(collectionName).deleteOne(query, function (err, res) {
                if (err) {
                    throw err;
                }
                console.log("One test deleted: " + res);
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
            response.send("test Name is not matched or test Name format is not correct.");
        }
    });
});
module.exports = router;
