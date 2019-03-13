// Speech to Text translation program

// Initialize the csv to json module
const csvFilePath='./csv/2018_Finan_Call_data.csv'
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
const fields = ["Call Id", "Words"]

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

main()
/*
const dbUri = "mongodb://main:se4455@main-shard-00-00-gkrza.mongodb.net:27017,main-shard-00-01-gkrza.mongodb.net:27017,main-shard-00-02-gkrza.mongodb.net:27017/test?ssl=true&replicaSet=Main-shard-0&authSource=admin&retryWrites=true";

const options = {
  dbName: "Main",
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  poolSize: 10
};

mongoose.connect(dbUri, options).then(
  () => {
    console.log("Database connection established!");

    // Run the program once successfully established: 
    main()
  },
  err => {
    console.log("Error connecting Database instance due to: ", err);
  }
);

*/
// -----------------------------------------------------------------------------

var once = false
var i = 0
var jsonArray;

async function main(){
console.log("Loading script")


if(!once){
  jsonArray = await csv().fromFile(csvFilePath);
}

once = true


// loop through all call url files
var lastLink = false

// Access the metadata of the call object: 
var metadata = jsonArray[i]
var dest = "./downloads/" + metadata['Call Id'] + ".mp3"
var callId = metadata['Call Id']
var url = metadata['Audio URL']

// Check if the call is a service or sale
//if(metadata["Prospect/Non-Prospect"] == 'Service' || metadata["Prospect/Non-Prospect"] == 'Sales'){
  await download(url, dest, callId, metadata, function(x){

    console.log("download mp3 #: " + i)

    if(i == 0){
      console.log("Last file")
      lastLink = true
    }

    // Convert the audio file into text
    convertMP3toWAV(dest, callId,lastLink, metadata, function(){
     // console.log("Callback finished!")

     if(!lastLink){
       console.log("not over yet")
       i++
       main()
     }

    })
    //convert2Flac()

    // if
  
    })
  //}


  

}


// Download the CSV file from call source
async function download(url, dest,callId, metadata, cb) {
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




// Use the SoX CLI to convert the mp3 file (from call source) into a .wav format
async function convertMP3toWAV(dest, callId,lastLink, metadata, cb) {

  // Define variable locations
  var mp3File = dest
  var outputDestiation = './wavFiles/' + callId + ".wav"


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
         upload2GoogleBucket(outputDestiation, callId,lastLink, metadata, function(){

          cb()
         })
         
      });
      job.start();
    });
}

// Upload the convert file to Google Cloud Storage
// All audio files over 1 minute must be from GCS for the Google Speech to Text API. 
async function upload2GoogleBucket(localUrl, callId,lastLink, metadata, cb2){

  // Create a storage client
  const storage = new Storage();

  // Specify the bucket name for all files
  const bucketName = "formatedwavfiles"

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

var name = callId + ".wav"

// Makes the file public
await storage
  .bucket(bucketName)
  .file(name)
  .makePublic();

console.log(`gs://${bucketName}/${name} is now public.`);

 googleSpeech2Text(name,lastLink, metadata, function(){
  cb2()
 })
  
}


// Call the google speech to text API, referencing an audio file in GCS
async function googleSpeech2Text(name,lastLink, metadata, cb3) {
  console.log("inside speech to text")

  const audio = {
    uri:  "gs://formatedwavfiles/" + name
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

  /*
  var hash = {}


  for(var i = 0; i<= wordsInfo.length - 1; i++){
    if(hash[wordsInfo[i].word]){
      let temp = hash[wordsInfo[i].word]
      temp.count += 1
      hash[wordsInfo[i].word] = temp

    }else{
      let temp = {}
      temp.word = wordsInfo[i].word
      temp.count = 1
      hash[wordsInfo[i].word] = temp
     // console.log("Just set: " + JSON.stringify(hash[wordsInfo[i].word]))
    }
  }

 // console.log("The finished hash: " + JSON.stringify(hash))

  // Convert JSON object into arrays of json objects
  var list = ""

  Object.keys(hash).forEach(function(key) {
    list.push(hash[key])
  });
  


  // Build the JSON object to send to mongo
  var mongoObj = {}

  mongoObj.transcription = JSON.stringify(list)
  mongoObj.callId = parseInt(name)
  mongoObj.date = metadata["Date"]
  mongoObj.time = parseInt(metadata["Time"])
  mongoObj.duration = metadata["Duration"]
  mongoObj.prospect = metadata["Prospect/Non-Prospect"]
  mongoObj.callStatus = metadata["Call Status"]
  mongoObj.callerNumber = parseInt(metadata["Caller Number"])
  */

 //let newTranscription = new Transcription(mongoObj)

  //console.log("Final schema object: " + JSON.stringify(mongoObj))

  let temp = {}
  temp["Call Id"] = metadata["Call Id"]
  temp.Words = sentence

  myCSV.push(temp)

  console.log("Final: " + JSON.stringify(myCSV))

  // Check if that was the last song:
  if(lastLink){
    //const opts ={fields}
    const parser = new Json2csvParser({fields});
    const csv = parser.parse(myCSV);

    console.log("Last link confirmed!")

 

    fs.writeFile("temp.csv", csv, function(err, data) {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
    

  }

  cb3()


}
