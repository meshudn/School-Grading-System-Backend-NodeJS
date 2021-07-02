const express = require("express");
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());

const userRoute = require("./routes/users");
app.use("/api/v1/users", userRoute);

const classRoute = require("./routes/classes");
app.use("/api/v1/classes", classRoute);

app.get("/", (request,response) => {
    response.send("Welcome to the Fastest School Grading System");
});


app.listen(3000);
