/*
* API /grades
* Grades Add, Remove, Update
* */
const express = require("express");
const router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoDbUrl = "mongodb://localhost:27017/";
const collectionName = "grades";

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
    let query_testId, query_studentId;
    try {
        query_testId = request.query.testId;
        query_studentId = request.query.studentId;
    } catch (e) {
        query_testName = "";
        query_studentId = "";
        response.status(400);
    }
    console.log("id: " + user_query);
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query;
        query = {
            testId: query_testId,
            studentId: query_studentId,
            archived: "false"
        };
        if (query) {
            dbo.collection(collectionName).find(query).toArray(function (err, res) {
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
            gradeId: "g" + Date.now() + Math.floor(Math.random() * 1000),
            testId:  object.testId,
            subjectId: object.subjectId,
            classId: object.classId,
            userId: object.userId,
            testDate: object.testDate,
            grade: object.grade,
            gradePoint: object.gradePoint,
            marks: object.marks,
            archived: "false"
        };
        dbo.collection(collectionName).insertOne(collection, function (err, res) {
            if (err) throw err;
            console.log("One subject inserted");
            response.status(201);
            response.send("/grades/" + collection.testId);
            db.close();
        });
    });
});

router.put("/:id", (request, response) => {
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
        if (object.testId && object.subjectId && object.classId && object.userId && object.testDate &&  object.grade &&  object.gradePoint &&  object.marks &&   object.archived) {
            collection = {
                $set: {
                    testId: object.testId,
                    testDate: object.testDate,
                    subjectId: object.subjectId,
                    classId: object.classId,
                    userId: object.userId,
                    grade: object.grade,
                    gradePoint : object.gradePoint,
                    marks: object.marks,
                    archived: object.archived,
                }
            };
        } else {
            response.status(400);
            response.send("Please provide all the information to update.");
        }
        var query = {
            testId: queryId
        };
        dbo.collection(collectionName).updateOne(query, collection, function (err, res) {
            if (err) throw err;
            console.log("One grade updated");
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
    /*
    * id: gradeID of the test
    * */
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
            gradeId: user_query
        };
        if (user_query) {
            dbo.collection(collectionName).deleteOne(query, function (err, res) {
                if (err) {
                    throw err;
                }
                console.log("One grade deleted: " + res);
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
            response.send("grade id is not matched or grade id format is not correct.");
        }
    });
});
module.exports = router;
