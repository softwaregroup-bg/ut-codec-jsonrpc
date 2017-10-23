'use strict';
const create = require('ut-error').define;
const jsonRPC = create('jsonRPCCodec');
const invalidJson = create('invalidJson', jsonRPC, 'Invalid json');

module.exports = {
    jsonRPC,
    invalidJson,
    invalidVersion: create('invalidVersion', invalidJson, 'Invalid jsonrpc version'),
    invalidMethod: create('invalidMethod', invalidJson, 'Invalid or missing method'),
    invalidPayload: create('invalidPayload', invalidJson, 'Invalid or missing jsonrpc payload'),
    invalidMessageID: create('invalidMessageID', invalidJson, 'Invalid message id')
};
