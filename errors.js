'use strict';
module.exports = ({defineError, getError, fetchErrors}) => {
    if (!getError('jsonRPCCodec')) {
        const jsonRPC = defineError('jsonRPCCodec', null, 'JSON RPC generic');
        const invalidJson = defineError('invalidJson', jsonRPC, 'Invalid json');

        defineError('invalidVersion', invalidJson, 'Invalid jsonrpc version');
        defineError('invalidMethod', invalidJson, 'Invalid or missing method');
        defineError('invalidPayload', invalidJson, 'Invalid or missing jsonrpc payload');
        defineError('invalidMessageID', invalidJson, 'Invalid message id');
    }

    return fetchErrors('jsonRPCCodec');
};
