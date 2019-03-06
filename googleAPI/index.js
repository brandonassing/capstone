// Speech to Text translation program

// Initialize the csv to json module
const csvFilePath='./csv/2018_Finan_Call_data.csv'
const csv=require('csvtojson')

// HTTP configuration for downloading MP3 files
const https = require('https');
const fs = require('fs');

// For indentifying audio files:
// Must download the sox CLI to run first. For MAC, use home brew to download: https://brewinstall.org/Install-sox-on-Mac-with-Brew/
var sox = require('sox');


// Imports the Google Cloud client library
const speech = require('@google-cloud/speech').v1p1beta1;

// Config format for each phone call 


// Run the script
//main()


async function main(){
console.log("Loading script")


const jsonArray= await csv().fromFile(csvFilePath);
console.log("First url of array: " + JSON.stringify(jsonArray[0]['Audio URL']))

var dest = "./downloads/audioFile.mp3"
var url = jsonArray[0]['Audio URL']


// Configure the 

await download(url, dest, function(x){
  console.log("yo")

  // Convert the audio file into text
  //speechTranscribeDiarization()

})


}

async function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    console.log("yo something happened")
    file.on('finish', function() {

      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};





speechTranscribeDiarization()



// Demo Application for google speech to text API
async function speechTranscribeDiarization() {
    // [START speech_transcribe_diarization_beta]
    const fs = require('fs');
  
    // Imports the Google Cloud client library
    const speech = require('@google-cloud/speech').v1p1beta1;
  
    // Creates a client
    const client = new speech.SpeechClient();


  



   sox.identify('./downloads/audioFile.mp3', function(err, results) {
    
      console.log("Inside details: " + JSON.stringify(results))
      // these options are all default, you can leave any of them off
      
      var job = sox.transcode('./downloads/audioFile.mp3', './transcodes/converted.wav', {
        sampleRate: 8000,
        format: 'wav',
        channelCount: 1,
        bitRate: 1024,
        compressionQuality: 5, // see `man soxformat` search for '-C' for more info
      });
      job.on('error', function(err) {
        console.error(err);
      });
      job.on('progress', function(amountDone, amountTotal) {
        console.log("progress", amountDone, amountTotal);
      });
      job.on('src', function(info) {
        console.log("here; " + JSON.stringify(info))
        /* info looks like:
        {
          format: 'wav',
          duration: 1.5,
          sampleCount: 66150,
          channelCount: 1,
          bitRate: 722944,
          sampleRate: 44100,
        }
        */
      });
      job.on('dest', function(info) {
        console.log("here 2; " + JSON.stringify(info))
        /* info looks like:
        {
          sampleRate: 44100,
          format: 'mp3',
          channelCount: 2,
          sampleCount: 67958,
          duration: 1.540998,
          bitRate: 196608,
        }
        */
      });
      job.on('end', function() {
        console.log("all done");

        speechTranscribeDiarization2()



      });
      job.start();



    });


 
    /*
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);
    console.log(`Speaker Diarization:`);
    const result = response.results[response.results.length - 1];
    const wordsInfo = result.alternatives[0].words;

    for(var i = 0; i<= wordsInfo.length - 1; i++){
      console.log("Word object " + i + ": " + JSON.stringify(wordsInfo[i]))
    }
*/

  }


  // Demo Application for google speech to text API
async function speechTranscribeDiarization2() {
  // [START speech_transcribe_diarization_beta]
  const fs = require('fs');

  // Imports the Google Cloud client library
 // const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();



  const config = {
    encoding: `LINEAR16`,
    sampleRateHertz: 8000,
    languageCode: `en-US`,
    enableSpeakerDiarization: true,
    diarizationSpeakerCount: 2,
    model: `phone_call`,
  };

  var fileName = "./transcodes/converted.wav"

  const audio = {
    content: fs.readFileSync(fileName).toString('base64'),
  };
  
  const request = {
    config: config,
    audio: audio,
  };
  
  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);
  // Get a Promise representation of the final result of the job
  
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');


  const result = response.results[response.results.length - 1];
  const wordsInfo = result.alternatives[0].words;
  for(var i = 0; i<= wordsInfo.length - 1; i++){
    console.log("Word object " + i + ": " + JSON.stringify(wordsInfo[i]))
  }

}

//speechTranscribeDiarization2()