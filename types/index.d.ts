import { ArrayOrObject, concurrent, DseClientOptions, QueryOptions, types, ValueCallback } from "cassandra-driver";
import { Readable } from 'stream';

export class Client {
    constructor(
        clientName: string, 
        keyspace: string, 
        clientDataCenter: string, 
        clientOptions: DseClientOptions, 
        emiiter?: any,
    );

    connect(): Promise<void|Error>;
    
    execute(query: string, params?: ArrayOrObject, queryOptions?: QueryOptions): Promise<types.ResultSet|Error>;
    
    batchExecute(
        queries: Array<string|{query: string, params?: ArrayOrObject}>,
        queryOptions?: QueryOptions
    ): Promise<types.ResultSet | Error>;
    
    eachRow(
        query: string,
        params: ArrayOrObject,
        queryOptions: QueryOptions,
        rowCallback: (n: number, row: types.Row) => void,
        callback?: ValueCallback<types.ResultSet>
    ): void;

    eachRow(
        query: string,
        params: ArrayOrObject,
        rowCallback: (n: number, row: types.Row) => void,
        callback?: ValueCallback<types.ResultSet>
    ): void;

    eachRow(
        query: string,
        rowCallback: (n: number, row: types.Row) => void
    ): void;

    concurrentExecute(
        query: string,
        parameters: any[][]|Readable,
        options?: concurrent.Options
    ): Promise<concurrent.ResultSetGroup|Error>;

    concurrentExecute(
        query: string,
        options?: concurrent.Options
    ): Promise<concurrent.ResultSetGroup|Error>;

    shutdown(): Promise<void|Error>;
}
