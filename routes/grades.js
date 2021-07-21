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
    let query_testId, query_subjectId, query_studentId;
    try {
        query_testId = request.query.testId;
        query_subjectId = request.query.subjectId;
        query_studentId = request.query.studentId;
        console.log(query_subjectId);
        console.log(query_testId);
    } catch (e) {
        console.log(e);
        //response.status(400);
    }
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query;
        if(query_studentId && query_subjectId && query_testId){
            query = {
                testId: query_testId,
                subjectId: query_subjectId,
                studentId: query_studentId
            };
        }else if(query_subjectId && query_testId){
            query = {
                subjectId: query_subjectId,
                testId: query_testId
            };
        }
        else if(query_studentId){
            query = {
                studentId: query_studentId
            };
        }else{
            query = {
                testId: query_testId,
                subjectId: query_subjectId,
                studentId: query_studentId
            };
        }

        dbo.collection(collectionName).find(query).toArray(function (err, res) {
            if (err) throw err;
            //console.log(res);

            if (res.length > 0) {
                console.log("200 grades");
                response.status(200);
                response.send(res);
            } else {
                response.status(204);
                console.log("204 grades");
                response.send("");
            }
            db.close();
        });
    });
});
router.post("/", (request, response) => {
    const object = request.body;
    console.log("request data: " + request.body);
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");

        var collection1 = {
            gradeId: "g" + Date.now() + Math.floor(Math.random() * 1000),
            testId: object.testId,
            testName: object.testName,
            subjectId: object.subjectId,
            subjectName: object.subjectName,
            classId: object.classId,
            studentId: object.studentId,
            studentName: object.studentName,
            grade: object.grade,
            archived: "false"
        };
        dbo.collection(collectionName).insertOne(collection1, function (err, res) {
            if (err) throw err;
            console.log("One subject inserted");
            response.status(201);
            response.send("/grades/" + collection1.testId);
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
        if (object.testId && object.testName && object.subjectId && object.classId && object.subjectName && object.studentId && object.studentName && object.grade && object.archived) {
            collection = {
                $set: {
                    testId: object.testId,
                    testName: object.testName,
                    subjectId: object.subjectId,
                    classId: object.classId,
                    subjectName: object.subjectName,
                    studentId: object.studentId,
                    studentName: object.studentName,
                    grade: object.grade,
                    archived: object.archived,
                }
            };
        } else {
            response.status(400);
            response.send("Please provide all the information to update.");
        }
        var query = {
            gradeId: queryId
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
