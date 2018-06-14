'use strict';

var packageData = require('../package.json');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = function (options) {
  return new StubTransport(options);
};

function StubTransport(options) {
  EventEmitter.call(this);
  this.options = options || {};
  this.name = 'Stub';
  this.version = packageData.version;
}
util.inherits(StubTransport, EventEmitter);

StubTransport.prototype.isIdle = function () {
  return true;
};

StubTransport.prototype.verify = function (callback) {
  setImmediate(function () {
    if (this.options.error) {
      return callback(new Error(this.options.error));
    }
    return callback(null, true);
  }.bind(this));
};

StubTransport.prototype.send = function (mail, callback) {
  var data = mail.data;
  var messageId;

  if (!(messageId = mail.message.getHeader("message-id"))) {
    messageId = crypto.createHash('sha1').update(data.html || data.text).digest('hex');
  }

  mail.message.id = messageId.replace(/[<>\s]/g, "");

  var info = {
    envelope: data.envelope || mail.message.getEnvelope(),
    messageId: mail.message.id
  };
  callback(null, info);
};

/**
 * Log emitter
 * @param {String} level Log level
 * @param {String} type Optional type of the log message
 * @param {String} message Message to log
 */
StubTransport.prototype._log = function ( /* level, type, message */ ) {
  var args = Array.prototype.slice.call(arguments);
  var level = (args.shift() || 'INFO').toUpperCase();
  var type = (args.shift() || '');
  var message = util.format.apply(util, args);

  this.emit('log', {
    name: packageData.name,
    version: packageData.version,
    level: level,
    type: type,
    message: message
  });
};
