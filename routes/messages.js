/*
* API /message
* message Add, Remove, Update
* */
const express = require("express");
const router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoDbUrl = "mongodb://localhost:27017/";
const collectionClass = "messages";
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
    let query_senderId,query_receiverId, query_messageId;

    try {
        query_senderId = request.query.senderId;
        query_receiverId = request.query.query_receiverId;
        query_messageId = request.query.messageId;
    } catch (e) {
        console.log(e);
    }
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query;
        query = {
          archived: "false"
        };
        if(query_senderId){
            query.senderId = query_senderId;
        }
        if(query_receiverId){
            query.receiverId = query_receiverId;
        }
        if(query_messageId){
            query.messageId = query_messageId;
        }
        if(query_senderId && query_receiverId){
            query ={
                senderId: query_senderId,
                receiverId: query_receiverId
            }
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
            messageId: "m" + Date.now() + Math.floor(Math.random() * 1000),
            senderId: object.senderId,
            receiverId: object.receiverId,
            text: object.text,
            seen: object.seen,
            archived: "false"
        };
        dbo.collection(collectionClass).insertOne(collection, function (err, res) {
            if (err) throw err;
            console.log("One message inserted");
            response.status(201);
            response.send();
            db.close();
        });
    });
});

router.put("/:id", (request, response) => {
    let user_query;
    try {
        user_query = request.params.id;
    } catch (e) {
        user_query = "";
        response.status(400);
    }
    const object = request.body;
    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var collection = {
                $set: {
                    messageId: object.messageId
                }
            };

        var query = {
            messageId: user_query
        };

        dbo.collection(collectionClass).updateOne(query, collection, function (err, res) {
            if (err) throw err;
            console.log("One message updated");
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
router.delete("/", (request, response) => {

    MongoClient.connect(mongoDbUrl, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        var dbo = db.db("school_grading_system");
        var query = {
            archived: "false"
        };
        if (query) {
            dbo.collection(collectionClass).deleteMany(query, function (err, res) {
                if (err) {
                    throw err;
                }
                console.log("One message deleted: " + res);
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
            response.send("Class id not matched.");
        }

    });
});

module.exports = router;
