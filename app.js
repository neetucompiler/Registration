const express = require('express')
const app = express()
const path = require('path')
const helmet = require('helmet')

app.use(helmet())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.set('port', process.env.port || 8080)
var server = app.listen(app.get('port'), (err) => {
  if (err) throw err
  console.log(`App started on port: ${server.address().port}`)
})