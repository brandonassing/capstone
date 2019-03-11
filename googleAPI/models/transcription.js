var mongoose = require('mongoose')
var Schema = mongoose.Schema

var TranscriptionSchema = new Schema({
    transcription: [{
        word: String,
        count: Number
    }],
    callId: Number,
    date: String,
    time: String,
    duration: Number,
    prospect: String,
    callStatus: String,
    callerNumber: Number
})


module.exports = mongoose.model('Transcriptions', TranscriptionSchema)




