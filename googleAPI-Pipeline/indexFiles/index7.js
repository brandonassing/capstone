// Speech to Text translation program

// Initialize the csv to json module
//const csvFilePath='./csv/2018_Finan_Call_data.csv'
const csvFilePath='./csv/tr_processing.csv'


const csv=require('csvtojson')

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Your Google Cloud Platform project ID
const projectId = 'leadsense-230423';

// HTTP configuration for downloading MP3 files
const https = require('https');
const fs = require('fs');

// Import the json 2 csv converter
const Json2csvParser = require('json2csv').Parser;
//const fields = ['transcription', 'callId', 'date', 'time', 'duration','prospect','callStatus','callerNumber'];
const fields = ["Unique Id","Call Id", "Words"]

const myCSV = []


// For parsing bodies
const express = require("express");

const BodyParser = require("body-parser");


// For indentifying audio files:
// Must download the sox CLI to run first. For MAC, use home brew to download: https://brewinstall.org/Install-sox-on-Mac-with-Brew/
var sox = require('sox');

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech').v1p1beta1;

// Import Mongo stuff
const mongoose = require('mongoose')
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
var creds = require("./config/config.js")
mongoose.Promise = global.Promise


// Create a speech client
const client = new speech.SpeechClient();

// Speech client configuration settings: 
const clientConfig = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'en-US',
  enableSpeakerDiarization: true,
  audioChannelCount: 2,
  enableSeparateRecognitionPerChannel: true,
  diarizationSpeakerCount: 2,
  model: 'phone_call'
};

// Grab the mongo schema:
const Transcription = require("./models/transcription.js")

// Express app stuff: -----------------------------------------------------------------------------
var app = express();
var router = express.Router()
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var querystring = require("querystring");


//convert()

main()

// global script variables ---------
var once = false
var i = 1800 // SCRIPTS PICKS UP AT THIS INDEX
var jsonArray;
var lastLink = false
// global script variables ----------

async function main(){
console.log("Loading script")


if(!once){
  jsonArray = await csv().fromFile(csvFilePath);
}
once = true

// loop through all call url files



// Access the metadata of the call object: 
var metadata = jsonArray[i]
//console.log("the jsonArray: " + JSON.stringify(jsonArray[0]))
var unique = i //metadata['Unique Id']
var callId = metadata['Call Id']
var dest = "./downloads7/" + unique + ".mp3"
var url = metadata['Audio URL']

  await download(url, dest, callId, metadata,unique, function(x){

    console.log("download mp3 #: " + i)

    // Set the limit of this script
    if(i == 2199){
      console.log("Last file")
      lastLink = true
    }

    // Convert the audio file into text
    convertMP3toWAV(dest, callId,lastLink, metadata,unique, function(){
     // console.log("Callback finished!")

        if(!lastLink){
          console.log("not over yet")
          i++
          main()
        }

      })
    })
}


// Download the CSV file from call source
async function download(url, dest,callId, metadata, unique, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

/*
async function convert2Flac(){

  const ffmpeg = require('fluent-ffmpeg');
  let track = './downloads/audioFile.mp3';//your path to source file

  ffmpeg(track)
  .toFormat('flac')
  .audioChannels(2)
  .audioFrequency(16000)
  .audioBitrate('128k')
  .on('error', (err) => {
      console.log('An error occurred: ' + err.message);
  })
  .on('progress', (progress) => {
      // console.log(JSON.stringify(progress));
      console.log('Processing: ' + progress.targetSize + ' KB converted');
  })
  .on('end', () => {
      console.log('Processing finished !');

    // Upload to google bucket:
    var googleBucketAddress = "./transcodes/please.flac"
    upload2GoogleBucket(googleBucketAddress)

  })
  .save('./transcodes/please.flac');//path where you want to save your file


}
*/

// Use the SoX CLI to convert the mp3 file (from call source) into a .wav format
async function convertMP3toWAV(dest, callId,lastLink, metadata,unique, cb) {

  // Define variable locations
  var mp3File = dest
  var outputDestiation = './wavFiles7/' + unique + ".wav"


   sox.identify(mp3File, function(err, results) {
    
      // Preview the details about the mp3 file:
      console.log("Inside details: " + JSON.stringify(results))
      
      var job = sox.transcode(mp3File, outputDestiation, {
        sampleRate: 16000,
        format: 'wav',
        channelCount: 2,
       // bitRate: 16384,
        compressionQuality: 8, // see `man soxformat` search for '-C' for more info
      });
      job.on('error', function(err) {
        console.error(err);
      });
      job.on('progress', function(amountDone, amountTotal) {
        console.log("progress", amountDone, amountTotal);
      });
      job.on('src', function(info) {});
      job.on('dest', function(info) {
        console.log("WAV file details: " + JSON.stringify(info))
      });
      job.on('end', function() {
        console.log("Conversion complete.");
        // Upload the file location to Google Cloud Storage
        
         upload2GoogleBucket(outputDestiation, callId,lastLink, metadata,unique, function(){

          cb()
         })
         
      });
      job.start();
    });
}

// Upload the convert file to Google Cloud Storage
// All audio files over 1 minute must be from GCS for the Google Speech to Text API. 
async function upload2GoogleBucket(localUrl, callId,lastLink, metadata, unique, cb2){

  // Create a storage client
  const storage = new Storage();

  // Specify the bucket name for all files
  const bucketName = "formatedwavfiles7"

  // Uploads a local file to tshe bucket
  await storage.bucket(bucketName).upload(localUrl, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: false
    /*
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      //cacheControl: 'public, max-age=31536000',
     // cacheControl: 'no-transform',
     // contentEncoding: 'gzip'
    },
    */
  });

console.log(`${localUrl} uploaded to ${bucketName}.`);

var name = unique + ".wav"


// Makes the file public
await storage
  .bucket(bucketName)
  .file(name)
  .makePublic();

console.log(`gs://${bucketName}/${name} is now public.`);

 googleSpeech2Text(name, callId, lastLink, metadata,unique, function(){
  cb2()
 })
  
}


// Call the google speech to text API, referencing an audio file in GCS
async function googleSpeech2Text(name,callId, lastLink, metadata,unique, cb3) {
  console.log("inside speech to text for id: " + name)

  const audio = {
    uri:  "gs://formatedwavfiles7/" + name
  };
  
  const request = {
    config: clientConfig,
    audio: audio,
  };
  
  // Make the API call:
  const [operation] = await client.longRunningRecognize(request);
  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');

  // Display the results:
  const result = response.results[response.results.length - 1];
  const wordsInfo = result.alternatives[0].words;

  var sentence = ""

  for(var i = 0; i<= wordsInfo.length - 1; i++){
    console.log("Saving this word: " + wordsInfo[i].word)
    sentence += wordsInfo[i].word + " "
  }

 
 
  let temp = {}
  temp["Unique Id"] = unique
  temp["Call Id"] = callId
  temp.Words = sentence
  //temp.Prospect = metadata["Prospect/Non-Prospect"]

  myCSV.push(temp)

  console.log("Final: " + JSON.stringify(myCSV))

  // Check if that was the last song:
  if(lastLink){
    //const opts ={fields}
    const parser = new Json2csvParser({fields});
    const csv = parser.parse(myCSV);

    console.log("Last link confirmed!")

    fs.writeFile("Transcriptions1800-2199.csv", csv, function(err, data) {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
    

  }

  cb3()


}

/*
function convert(){
  
  const parser = new Json2csvParser({fields});
  const csv = parser.parse(qwer);

  fs.writeFile("Transcription2200-2429.csv", csv, function(err, data) {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });


}
*/
