const EventEmitter = require('events').EventEmitter
const async = require('async')
const Dnode = require('dnode')
const EthQuery = require('eth-query')
const launchMetamaskUi = require('../../ui')
const StreamProvider = require('web3-stream-provider')
const setupMultiplex = require('./lib/stream-utils.js').setupMultiplex


module.exports = initializePopup


function initializePopup ({ container, connectionStream }, cb) {
  // setup app
  async.waterfall([
    (cb) => connectToAccountManager(connectionStream, cb),
    //本质上返回了一个RPC调用的S端的所有可调用接口，popup本身是一个C端，content是S端？
    (accountManager, cb) => launchMetamaskUi({ container, accountManager }, cb),
  ], cb)
}

function connectToAccountManager (connectionStream, cb) {
  // setup communication with background
  // setup multiplexing
  var mx = setupMultiplex(connectionStream)
  // connect features
  setupControllerConnection(mx.createStream('controller'), cb)
  setupWeb3Connection(mx.createStream('provider'))
}

function setupWeb3Connection (connectionStream) {
  var providerStream = new StreamProvider()
  providerStream.pipe(connectionStream).pipe(providerStream)
  connectionStream.on('error', console.error.bind(console))
  providerStream.on('error', console.error.bind(console))
  global.ethereumProvider = providerStream
  global.ethQuery = new EthQuery(providerStream)
}

function setupControllerConnection (connectionStream, cb) {
  // this is a really sneaky way of adding EventEmitter api
  // to a bi-directional dnode instance
  var eventEmitter = new EventEmitter()
  var accountManagerDnode = Dnode({
    sendUpdate: function (state) {
      eventEmitter.emit('update', state)
    },
  })
  //https://github.com/substack/dnode
  //这就是dnode的一个标准写法，具体为啥要这么写，我也不明白
  //本质意义就是accountManagerDnode是一个RPC调用的C端，里面的所有操作都实际发生在S端
  //connectionStream是这个RPC的链接
  connectionStream.pipe(accountManagerDnode).pipe(connectionStream)
  accountManagerDnode.once('remote', function (accountManager) {
    // setup push events
    accountManager.on = eventEmitter.on.bind(eventEmitter)
    cb(null, accountManager)
  })
}
