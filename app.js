const express = require("express");
const expressFileUpload = require("express-fileupload");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const docxConverter = require('docx-pdf');
const mailer = require("./mailer");
//const { reject } = require("underscore");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fileData = {
    name: undefined,
    userEmail: undefined,
    numberOfConversions: 0 //napravi json fajl u ubaci tu vrijednost 
}

const app = express();
const port = process.env.PORT || 3000;
const wordType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

app.set("view engine", "hbs");
app.set('views', path.join("public", "views"));

app.use(express.static('public'));
app.use(expressFileUpload());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    if (req.query.ready === "true") {
        res.render("index.hbs", {
            ready: true,
            fileName: req.query.name,
            email: fileData.userEmail,
            convNum: fileData.numberOfConversions
        });
    } else {
        res.render("index.hbs", {
            convNum: fileData.numberOfConversions
        });
    }
});

app.post("/upload", (req, res) => {
    if (req.files.uploadWord && req.body.userEmail) {
        const file = req.files.uploadWord;
        const name = file.name;
        const email = req.body.userEmail;
        const uploadpath = __dirname + "/uploads/" + name;
        fileData.name = name;
        fileData.userEmail = email;
        if (file.mimetype === wordType) {
            file.mv(uploadpath, (err) => {
                if (err) { console.log("File upload failed", name, err); }
                else {
                    convertToPdf(sliceName(fileData.name))
                        .then(() => {
                            mailer(fileData.userEmail, sliceName(fileData.name) + ".pdf");
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    fileData.numberOfConversions += 1;
                }
            });
        } else {
            res.send("Not a word file and Please attach a word File");
        }
        res.redirect(`/?ready=true&name=${sliceName(fileData.name)}.pdf`);
    } else { res.send("No file selected.") }
});

app.get("/download", (req, res) => {
    if (!isDirEmpty(__dirname + "/uploads")) {
        setTimeout(() => {
            res.download(__dirname + "/downloads/" + sliceName(fileData.name) + ".pdf");
        }, 100);
    } else {
        res.send("No files to download. Must upload your word file first.")
    }
});

function convertToPdf(fileName) {
    return new Promise((resolve, reject) => {
        docxConverter(__dirname + `/uploads/${fileName}.docx`, __dirname + `/downloads/${fileName}.pdf`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

//Provjeriti da li radi ovo
function isDirEmptyPromise(folder){
    return new Promise((resolve,reject)=>{
        if(isDirEmpty(folder)){
            resolve();
        }else{
            reject();
        }
    });
}

function isDirEmpty(folder) {
    const files = fs.readdirSync(folder);
    if (files.length === 0) {
        return true;
    }
    return false;
}

function sliceName(name) {
    return name.split(".")[0];
}

app.listen(port, () => { console.log("Server is running..."); })
