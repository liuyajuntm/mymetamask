const extend = require('xtend')
const BN = require('ethereumjs-util').BN
const template = {
  'status': 'submitted',
  'txParams': {
    'from': '0x7d3517b0d011698406d6e0aed8453f0be2697926',
    'gas': '0x30d40',
    'value': '0x0',
    'nonce': '0x3',
  },
}

class TxGenerator {

  constructor () {
    this.txs = []
  }

  generate (tx = {}, opts = {}) {
    let { count, fromNonce } = opts
    let nonce = fromNonce || this.txs.length
    let txs = []
    for (let i = 0; i < count; i++) {
      txs.push(extend(template, {
        txParams: {
          nonce: hexify(nonce++),
        }
      }, tx))
    }
    this.txs = this.txs.concat(txs)
    return txs
  }

}

function hexify (number) {
  return '0x' + (new BN(number)).toString(16)
}

module.exports = TxGenerator
