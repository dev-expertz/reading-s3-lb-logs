const ACCESS_KEY_ID='ACCESS_KEY_ID';
const SECRET_ACCESS_KEY='SECRET_ACCESS_KEY';
const BUCKET = 'loadbalancer-core';
const REGION = 'us-east-1';
const APIVERSION = '2006-03-01';
import gunzip from 'gunzip-file';
import { open } from 'fs/promises';
// Load the AWS SDK for Node.js
import AWS from 'aws-sdk';
// Set the region 
AWS.config.update({region: REGION, accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY});

// Create the parameters for calling listObjects
const bucketParams = {
  Bucket : BUCKET,
  Prefix: 'PREFIX_FOR_OBJECT'
};


// Create S3 service object
const s3 = new AWS.S3({apiVersion: APIVERSION});

const getFiles = async function(){
    // Call S3 to obtain a list of the objects in the bucket
    s3.listObjects(bucketParams, async function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
			console.log("Total Files/Objects", data.Contents.length);
            for(let i = 0; i < data.Contents.length; i++){
                const key = data.Contents[i].Key;
                const slashPos = key.lastIndexOf('/');
                if(slashPos === undefined || slashPos === null || slashPos < 0)
                {
                    continue;
                }
                const filename = key.substring(slashPos + 1);
                console.log("Fetching", i, filename);
                s3.getObject({Key: key, Bucket: BUCKET}, async function(error, buffer){
                    if (error) {
                        console.log("Error", err);
                    } else {
                        console.log("Writing", i, filename);
                        const handle = await open("downloads/" + filename, 'w');
                        await handle.write(buffer.Body);
                        await handle.close();
                        console.log("Extracting", i, filename);
                        gunzip('downloads/' + filename, 'downloads/extracted/' + filename.substring(0, filename.length - 3), () => {
                            console.log("Done", i, filename);
                          })
                    }
                });
            }            
        }
    });
}

getFiles();