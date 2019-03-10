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

// For indentifying audio files:
// Must download the sox CLI to run first. For MAC, use home brew to download: https://brewinstall.org/Install-sox-on-Mac-with-Brew/
var sox = require('sox');

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech').v1p1beta1;

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

// -----------------------------------------------------------------------------
// Run the script
main()

async function main(){
console.log("Loading script")

const jsonArray= await csv().fromFile(csvFilePath);
var dest = "./downloads/audioFile.mp3"
var url = jsonArray[0]['Audio URL']

await download(url, dest, function(x){

  // Convert the audio file into text
  convertMP3toWAV()
  })
}

// Download the CSV file from call source
async function download(url, dest, cb) {
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




// Use the SoX CLI to convert the mp3 file (from call source) into a .wav format
async function convertMP3toWAV() {

  // Define variable locations
  var mp3File = './downloads/audioFile.mp3'
  var outputDestiation = './transcodes/converted.wav'
  var googleBucketAddress = './transcodes/converted.wav'

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
        upload2GoogleBucket(googleBucketAddress)
      });
      job.start();
    });
}

// Upload the convert file to Google Cloud Storage
// All audio files over 1 minute must be from GCS for the Google Speech to Text API. 
async function upload2GoogleBucket(localUrl){

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

var name = "converted.wav"

// Makes the file public
await storage
  .bucket(bucketName)
  .file(name)
  .makePublic();

console.log(`gs://${bucketName}/${name} is now public.`);

googleSpeech2Text(name)
  
}


// Call the google speech to text API, referencing an audio file in GCS
async function googleSpeech2Text(name) {

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
  for(var i = 0; i<= wordsInfo.length - 1; i++){
    console.log("Word object " + i + ": " + JSON.stringify(wordsInfo[i]))
  }
}
