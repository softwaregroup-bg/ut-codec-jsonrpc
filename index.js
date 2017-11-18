'use strict';
module.exports = class JsonRpc {
    constructor({version = '2.0', encoding = 'utf8', nullId = false, fractionalId = false, defineError}) {
        if (!defineError) {
            throw new Error('Missing config.defineError, check if are you using latest version of ut-port-tcp.');
        }
        this.version = version;
        this.encoding = encoding;
        this.nullId = nullId;
        this.fractionalId = fractionalId;
        this.errors = require('./errors')(defineError);
    }

    getId(context) {
        if (Number.isSafeInteger(context.trace + 1)) {
            return ++context.trace;
        } else {
            context.trace = 0;
            return 0;
        }
    }

    parseJson(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            throw this.errors.invalidJson(e);
        }
    }

    decode(msg, $meta, context) {
        const packet = msg.toString(this.encoding);
        const json = this.parseJson(packet);

        if (json.jsonrpc !== this.version) {
            throw this.errors.invalidVersion(`Expected version ${this.version} but received ${json.jsonrpc}`);
        } else if (!this.nullId && json.id === null) {
            throw this.errors.invalidMessageID('Received null id value. nullId option is set to false');
        } else if (!['string', 'number', 'undefined'].includes(typeof json.id)) {
            throw this.errors.invalidMessageID('Received Invalid id type');
        } else if (!this.fractionalId && typeof json.id === 'number' && json.id % 1 > 0) {
            throw this.errors.invalidMessageID('Received fractional number as id. fractionalId option is set to false');
        } else if (json.id === '') {
            throw this.errors.invalidMessageID('Received empty id');
        } else if (json.id === undefined && typeof json.params !== 'object') {
            throw this.errors.invalidPayload('Received notification with missing or invalid payload member');
        } else if (typeof json.params !== 'object' && typeof json.result !== 'object' && typeof json.error !== 'object') {
            throw this.errors.invalidPayload('Received invalid payload');
        } else if (['params', 'result', 'error'].filter(key => !!json[key]).length > 1) {
            throw this.errors.invalidPayload('Received more than one payload member');
        }

        const payloadMember = ['params', 'result', 'error'].find(key => key in json);
        $meta.trace = json.id;
        $meta.mtid = {
            error: 'error',
            result: 'response',
            params: 'request',
            notification: 'notification'
        }[json.id ? payloadMember : 'notification'];
        if ($meta.mtid === 'request') {
            if (typeof json.method !== 'string' || json.method === '') {
                throw this.errors.invalidMethod('Received invalid method type or empty');
            }
            $meta.method = json.method;
        }
        return json[payloadMember];
    }

    encode(msg = {}, $meta, context) {
        if (($meta.mtid === 'error' || $meta.mtid === 'response') && !$meta.trace) {
            throw this.errors.invalidMessageID('Cannot send response without trace');
        } else if (!$meta.method) {
            throw this.errors.invalidMethod();
        }
        const json = {
            jsonrpc: this.version,
            method: $meta.method
        };
        switch ($meta.mtid) {
            case 'request':
                $meta.trace = $meta.trace || this.getId(context);
                json.id = $meta.trace;
                json.params = msg;
                break;
            case 'notification':
                json.params = msg;
                break;
            case 'response':
                json.id = $meta.trace;
                json.result = msg;
                break;
            case 'error':
                json.id = $meta.trace;
                json.error = msg;
                break;
        }
        return new Buffer(JSON.stringify(json), this.encoding);
    }
};
