const express = require('express')
const path = require('path')
const app = express()
const port = 8080

// Set the path to serve the static frontend files
app.use(express.static(path.join(__dirname, 'client/dist')));


// Used to connect the dist routes with the express routes. 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});



app.listen(port)

console.log("Running on port: " + port)