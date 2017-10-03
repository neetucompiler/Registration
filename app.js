const express = require('express')
const app = express()
const path = require('path')
const helmet = require('helmet')
// const compression = require('compression')
const url = require('url')
const fs = require('fs')

app.use(helmet())
// app.use(compression())
app.use(express.static(path.join(__dirname, './public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.get('/*.*', (req, res) => {
  var options = url.parse(req.url, true)
  var mime = Helper.getMime(options)
  serveFile(res, options.pathname, mime)
})

function serveFile(res, pathName, mime) {
  mime = mime || 'text/html'

  fs.readFile(__dirname + '/' + pathName, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" })
      return res.end('Error loading ' + pathName + " with Error: " + err)
    }
    res.writeHead(200, { "Content-Type": mime })
    res.end(data)
  })
}

app.set('port', process.env.port || 8080)
var server = app.listen(app.get('port'), (err) => {
  if (err) throw err
  console.log(`App started on port: ${server.address().port}`)
})
