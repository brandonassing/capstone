


speechTranscribeDiarization()

// Demo Application for google speech to text API
async function speechTranscribeDiarization() {
    // [START speech_transcribe_diarization_beta]
    const fs = require('fs');
  
    // Imports the Google Cloud client library
    const speech = require('@google-cloud/speech').v1p1beta1;
  
    // Creates a client
    const client = new speech.SpeechClient();
  
  
    const config = {
      encoding: `FLAC`,
      sampleRateHertz: 48000,
      languageCode: `en-US`,
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: 2,
      model: `phone_call`,
    };
  
    var fileName = "./voice/voiceTest.flac"

    const audio = {
      content: fs.readFileSync(fileName).toString('base64'),
    };
  
    const request = {
      config: config,
      audio: audio,
    };
  
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);
    console.log(`Speaker Diarization:`);
    const result = response.results[response.results.length - 1];
    const wordsInfo = result.alternatives[0].words;
    // Note: The transcript within each result is separate and sequential per result.
    // However, the words list within an alternative includes all the words
    // from all the results thus far. Thus, to get all the words with speaker
    // tags, you only have to take the words list from the last result:
    wordsInfo.forEach(a =>
      console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
    );
    // [END speech_transcribe_diarization_beta]
  }