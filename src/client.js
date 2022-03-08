const cassandra = require('cassandra-driver');

/**
 * Wrapper for DataStax'x nodeJs cassandra driver.
 * API reference: https://docs.datastax.com/en/developer/nodejs-driver/4.6/api/
 */

class Client {
    /**
     * Initializes a cassandra client instance.
     * 
     * @param {string} clientName: Name to identify a client, could be application/worker/service's name.   
     * @param {Object} emitter: to emit logs. 
     * @param {Object} clientOptions: Client and query configuration options while setting up the connection. 
     */
    constructor(clientName, emitter, clientOptions) {
        this.clientName = clientName;

        this.clientOptions = Object.assign({
            contactPoints: ['localhost'],
            keyspace: 'dummy_keyspace', 
            localDataCenter: 'client_data_center', // required by datastax client to perform load balancing.
        }, clientOptions, {
                policies: Object.assign({
                    // TODO: This policy neither retries or nor ignores. All the methods with this policy 
                    // throw exceptions. Thus, a retry policy needs to be added to the wrapper itself. 
                    retry: new cassandra.policies.retry.FallthroughRetryPolicy(),
                }, clientOptions?.policies),
                queryOptions: Object.assign({
                    prepare: true,
                }, clientOptions?.queryOptions),
            }
        );
        this.clientOptions.applicationName = clientName;
        console.log('Cassandra client options: ', this.clientOptions);
        this.emitter = emitter;
        this.client = new cassandra.Client(this.clientOptions);
    }

    async connect() {
        this.client.on('log', (level, loggerName, message, furtherInfo) => {
            if (level === 'verbose') {
                return;
            }
            level = level === 'info' ? 'log' : level;
            this._logMessage(level, `${loggerName}: ${message}`, furtherInfo);
        });
        return await this.client.connect();
    }

    /**
     * Executes a query on client.
     * Example:
     * const result = await client.execute(
     *      'SELECT eid, name, joining_date, department FROM employees WHERE eid = ?', 
     *      [10]
     * );
     * 
     * @param {string} query -  query to be executed. 
     * @param {Array | Object} params - params to be passed for parameterized query. 
     * @param {Object} queryOptions - per query execution options  
     * @returns 
     */

    async execute(query, params, queryOptions) {
        const result = await this.client.execute(query, params, queryOptions);
        return result;
    }

    /**
     * Only UPDATE, INSERT and DELETE statements are allowed.
     */
    async batchExecute(queries, queryOptions) {
        const result = await this.client.batch(queries, queryOptions);
        return result;
    }
    
    /**
     * Executes the query and calls the rowCallback for each of the row received. Calls the finall
     * callback at the end.
     * @param {string} query - query to be executed 
     * @param {Array | Object} params - params for parameterized query. 
     * @param {Object} queryOptions - per query execution options 
     * @param {Function} rowCallback - callback to be invoked for each row. 
     * @param {Function} callback - optional callback to be invoked after all rows have been received.
     */
    eachRow(query, params, queryOptions, rowCallback, callback) {
        this.client.eachRow(query, params, queryOptions, rowCallback, callback);
    }


    /**
     * Executes queries concurrently.
     * For usage examples, refer https://docs.datastax.com/en/developer/nodejs-driver/4.6/api/module.concurrent/.
     * 
     * @param {String} query - query to be executed 
     * @param {any[][]|Readable} params - params for query
     * @param {Object} options - concurrent execution options.
     */
    async concurrentExecute(query, params, options) {
        const result = await cassandra.concurrent.executeConcurrent(this, query, params, options);
        return result;
    }

    async shutdown() {
        return await this.client.shutdown();
    }

    _logMessage(msgType, message, data) {
        if (this.emitter != null) {
            this.emitter.emit(msgType, {
                clientId: this.clientName,
                message,
                data,
            });
        } else if (msgType === 'error') {
            console.error(this.clientName, message, typeof data !== 'undefined' ? data : '');
        } else if (msgType === 'warning') {
            console.warn(this.clientName, message, typeof data !== 'undefined' ? data : '');
        } else {
            console.log(this.clientName, message, typeof data !== 'undefined' ? data : '');
        }
    }

    log(message, data) {
        this._logMessage('log', message, data);
    }

    _success(message, data) {
        this._logMessage('success', message, data);
    }

    _error(err, data) {
        this._logMessage('error', err, data);
    }
}

module.exports = Client;