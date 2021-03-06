module.exports = function(url = location.href.replace('http', 'ws')){
  const io = emitterify({ attempt: 0 })
  io.ready = io.once('connected')
  io.connect = connect(io, url)
  io.connect() 
  io.send = data => io.ready.then(socket => socket.send(data))
  return io
}

const emitterify = require('utilise/emitterify')
    , { min, pow } = Math

const connect = (io, url) => () => {
  const { WebSocket, location, setTimeout } = window
      , socket = new WebSocket(url)
  socket.onopen = d => io.emit('connected', socket)
  socket.onmessage = d => io.emit('recv', d.data)
  socket.onclose = d => { 
    io.ready = io.once('connected')
    io.emit('disconnected')
    setTimeout(io.connect, backoff(++io.attempt))
  }
}

const backoff = (attempt, base = 100, cap = 10000) =>
  min(cap, base * pow(2, attempt))