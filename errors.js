'use strict';
module.exports = defineError => {
    const jsonRPC = defineError('jsonRPCCodec');
    const invalidJson = defineError('invalidJson', jsonRPC, 'Invalid json');

    return {
        jsonRPC,
        invalidJson,
        invalidVersion: defineError('invalidVersion', invalidJson, 'Invalid jsonrpc version'),
        invalidMethod: defineError('invalidMethod', invalidJson, 'Invalid or missing method'),
        invalidPayload: defineError('invalidPayload', invalidJson, 'Invalid or missing jsonrpc payload'),
        invalidMessageID: defineError('invalidMessageID', invalidJson, 'Invalid message id')
    };
};
