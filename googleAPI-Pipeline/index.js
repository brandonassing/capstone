const csvFilePath = process.argv[2].toString();
const csv = require("csvtojson");

// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");

// Your Google Cloud Platform project ID
const projectId = "leadsense-230423";

// HTTP configuration for downloading MP3 files
const https = require("https");
const fs = require("fs");

// Import the json 2 csv converter
const Json2csvParser = require("json2csv").Parser;
const fields = [
  "Date",
  "Time",
  "Employee",
  "Location",
  "Extension Routing",
  "Ad Source",
  "Routed Type",
  "Result",
  "Duration",
  "Status",
  "Tracking Number",
  "Caller Number",
  "Target Number",
  "Missed Opp",
  "Prospect/Non-Prospect",
  "Call Status",
  "Call Id",
  "Audio URL",
  "Campaign Id",
  "Campaign Name",
  "Location Code",
  "Location Id",
  "First Name",
  "Last Name",
  "Street Address",
  "City",
  "State",
  "Zip Code",
  "Country",
  "Appointment Set",
  "Appointment Date and Time",
  "Call Alert Status",
  "Words"
];

const myCSV = [];

// For indentifying audio files:
// Must download the sox CLI to run first. For MAC, use home brew to download: https://brewinstall.org/Install-sox-on-Mac-with-Brew/
var sox = require("sox");

// Imports the Google Cloud client library
const speech = require("@google-cloud/speech").v1p1beta1;

// Create a speech client
const client = new speech.SpeechClient();

// Speech client configuration settings:
const clientConfig = {
  encoding: "LINEAR16",
  sampleRateHertz: 16000,
  languageCode: "en-US",
  enableSpeakerDiarization: true,
  audioChannelCount: 2,
  enableSeparateRecognitionPerChannel: true,
  diarizationSpeakerCount: 2,
  model: "phone_call"
};

//convert()

main();

// global script variables ---------
var once = false;
var i = 0;
var jsonArray;
var lastLink = false;
// global script variables ----------

async function main() {
  console.log("Loading script...");

  if (!once) {
    jsonArray = await csv().fromFile(csvFilePath);
  }
  once = true;

  // loop through all call url files

  // Access the metadata of the call object:
  var metadata = jsonArray[i];
  var unique = i; //metadata['Unique Id']
  var callId = metadata["Call Id"];
  var dest = "googleAPI-Pipeline/downloads/" + unique + ".mp3";
  var url = metadata["Audio URL"];

  await download(url, dest, callId, metadata, unique, function(x) {
    console.log("Downloading mp3 file...");
    // Set the limit of this script
    if (i <= jsonArray.length - 1) {
      lastLink = true;
    }

    // Convert the audio file into text
    convertMP3toWAV(dest, callId, lastLink, metadata, unique, function() {
      if (!lastLink) {
        i++;
        main();
      }
    });
  });
}

// Download the CSV file from call source
async function download(url, dest, callId, metadata, unique, cb) {
  var file = fs.createWriteStream(dest);
  var request = https
    .get(url, function(response) {
      response.pipe(file);
      file.on("finish", function() {
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on("error", function(err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
}

async function convert2Flac() {
  const ffmpeg = require("fluent-ffmpeg");
  let track = "./downloads/audioFile.mp3"; //your path to source file

  ffmpeg(track)
    .toFormat("flac")
    .audioChannels(2)
    .audioFrequency(16000)
    .audioBitrate("128k")
    .on("error", err => {
      console.log("An error occurred: " + err.message);
    })
    .on("progress", progress => {})
    .on("end", () => {
      console.log("Processing finished!");

      // Upload to google bucket:
      var googleBucketAddress = "./transcodes/please.flac";
      upload2GoogleBucket(googleBucketAddress);
    })
    .save("./transcodes/please.flac"); //path where you want to save your file
}

// Use the SoX CLI to convert the mp3 file (from call source) into a .wav format
async function convertMP3toWAV(dest, callId, lastLink, metadata, unique, cb) {
  // Define variable locations
  var mp3File = dest;
  var outputDestiation = "googleAPI-Pipeline/wavFiles/" + unique + ".wav";

  sox.identify(mp3File, function(err, results) {
    // Preview the details about the mp3 file:
    console.log("MP3 file details: " + JSON.stringify(results));
    console.log("Converting MP3 file to WAV...");

    var job = sox.transcode(mp3File, outputDestiation, {
      sampleRate: 16000,
      format: "wav",
      channelCount: 2,
      // bitRate: 16384,
      compressionQuality: 8 // see `man soxformat` search for '-C' for more info
    });
    job.on("error", function(err) {
      console.error(err);
    });
    job.on("progress", function(amountDone, amountTotal) {
      // console.log("progress", amountDone, amountTotal);
    });
    job.on("src", function(info) {});
    job.on("dest", function(info) {
      console.log("WAV file details: " + JSON.stringify(info));
    });
    job.on("end", function() {
      console.log("Conversion complete!");
      // Upload the file location to Google Cloud Storage

      upload2GoogleBucket(
        outputDestiation,
        callId,
        lastLink,
        metadata,
        unique,
        function() {
          cb();
        }
      );
    });
    job.start();
  });
}

// Upload the convert file to Google Cloud Storage
// All audio files over 1 minute must be from GCS for the Google Speech to Text API.
async function upload2GoogleBucket(
  localUrl,
  callId,
  lastLink,
  metadata,
  unique,
  cb2
) {
  // Create a storage client
  const storage = new Storage();

  // Specify the bucket name for all files
  const bucketName = "formattedwavfiles";
  // Uploads a local file to tshe bucket
  await storage.bucket(bucketName).upload(localUrl, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: false
  });

  console.log(`${localUrl} uploaded to ${bucketName}.`);

  var name = unique + ".wav";

  // Makes the file public
  await storage
    .bucket(bucketName)
    .file(name)
    .makePublic();

  console.log(`gs://${bucketName}/${name} is now public.`);

  googleSpeech2Text(name, callId, lastLink, metadata, unique, function() {
    cb2();
  });
}

// Call the google speech to text API, referencing an audio file in GCS
async function googleSpeech2Text(
  name,
  callId,
  lastLink,
  metadata,
  unique,
  cb3
) {
  console.log("Transcribing audio file...");

  const audio = {
    uri: "gs://formattedwavfiles/" + name
  };

  const request = {
    config: clientConfig,
    audio: audio
  };

  // Make the API call:
  const [operation] = await client.longRunningRecognize(request);
  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join("\n");

  // Display the results:
  const result = response.results[response.results.length - 1];
  const wordsInfo = result.alternatives[0].words;

  var sentence = "";

  for (var i = 0; i <= wordsInfo.length - 1; i++) {
    sentence += wordsInfo[i].word + " ";
  }

  let temp = {};

  temp["Date"] = metadata["Date"];
  temp["Time"] = metadata["Time"];
  temp["Employee"] = metadata["Employee"];
  temp["Location"] = metadata["Location"];
  temp["Extension Routing"] = metadata["Extension Routing"];
  temp["Ad Source"] = metadata["Ad Source"];
  temp["Routed Type"] = metadata["Routed Type"];
  temp["Result"] = metadata["Result"];
  temp["Duration"] = metadata["Duration"];
  temp["Status"] = metadata["Status"];
  temp["Tracking Number"] = metadata["Tracking Number"];
  temp["Caller Number"] = metadata["Caller Number"];
  temp["Target Number"] = metadata["Target Number"];
  temp["Missed Opp"] = metadata["Missed Opp"];
  temp["Prospect/Non-Prospect"] = metadata["Prospect/Non-Prospect"];
  temp["Call Status"] = metadata["Call Status"];
  temp["Call Id"] = metadata["Call Id"];
  temp["Audio URL"] = metadata["Audio URL"];
  temp["Campaign Id"] = metadata["Campaign Id"];
  temp["Campaign Name"] = metadata["Campaign Name"];
  temp["Location Code"] = metadata["Location Code"];
  temp["Location Id"] = metadata["Location Id"];
  temp["First Name"] = metadata["First Name"];
  temp["Last Name"] = metadata["Last Name"];
  temp["Street Address"] = metadata["Street Address"];
  temp["City"] = metadata["City"];
  temp["State"] = metadata["State"];
  temp["Zip Code"] = metadata["Zip Code"];
  temp["Country"] = metadata["Country"];
  temp["Appointment Set"] = metadata["Appointment Set"];
  temp["Appointment Date and Time"] = metadata["Appointment Date and Time"];
  temp["Call Alert Status"] = metadata["Call Alert Status"];
  temp.Words = sentence;
  //temp.Prospect = metadata["Prospect/Non-Prospect"]

  myCSV.push(temp);

  console.log("Processed data: " + JSON.stringify(myCSV, null, 2));

  // Check if that was the last song:
  if (lastLink) {
    const parser = new Json2csvParser({ fields });
    const csv = parser.parse(myCSV);
    var filename = process.argv[2].toString().split("/");
    filename = filename[filename.length - 1];

    fs.writeFile("automation/transcriptions/" + filename, csv, function(
      err,
      data
    ) {
      if (err) console.log(err);
      console.log(
        "Successfully written to automation/transcriptions/" + filename
      );
    });
  }

  cb3();
}

function convert() {
  var qwer = "insert json array here";

  const parser = new Json2csvParser({ fields });
  const csv = parser.parse(qwer);

  fs.writeFile("Transcription2200-2387.csv", csv, function(err, data) {
    if (err) console.log(err);
    console.log("Successfully written to file.");
  });
}
