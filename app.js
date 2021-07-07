const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());

const userRoute = require("./routes/users");
app.use("/api/v1/users", userRoute);

const classRoute = require("./routes/classes");
app.use("/api/v1/classes", classRoute);

const subjectRoute = require("./routes/subjects");
app.use("/api/v1/subjects", subjectRoute);

const testRoute = require("./routes/tests");
app.use("/api/v1/tests", testRoute);

const gradeRoute = require("./routes/grades");
app.use("/api/v1/grades", gradeRoute);

const admissionRoute = require("./routes/admission");
app.use("/api/v1/admission", admissionRoute);

app.get("/", (request,response) => {
    response.send("Welcome to the Fastest School Grading System");
});
app.listen(3000);
