const path = require('path');
const lineReader = require('line-reader');
require('dotenv').config();
var AWS = require('aws-sdk');

// Create an S3 client
var s3 = new AWS.S3();
var bucketName = 'anlab-lashinbang';
var imageFolder = 'images';
var imageNewFolder = 'images-update';
var count = 0;
var thread = process.argv[2];
var countProcess = 0;
var countDone = 0;

lineReader.eachLine(path.resolve(__dirname, process.env.UPDATE_FILE), function(line) {
    let files = line.split(',');
    count++;

    if(count % 16 == thread) {
        let srcFile = imageFolder + '/' + files[0];
        let dstFile = imageNewFolder + '/' + files[1];

        var params = {
            Bucket: bucketName, 
            Key: dstFile,
            CopySource: bucketName + '/' + srcFile,
            ACL: 'public-read',
            CacheControl: 'public, max-age=31536000'
        };
        countProcess++;
        s3.copyObject(params, function(err, data) {
            countDone++;
            if(countDone % 100 == 0) {
                console.log("Count: " + count);
            }
            if (err)
                console.log("Error: " + srcFile);
            // else
            //     console.log("Successfully uploaded data to " + bucketName + "/" + dstFile);
        });
    }
});

while(true) {
    if(countDone === countProcess) {
        break;
    }
}

console.log('Exit');