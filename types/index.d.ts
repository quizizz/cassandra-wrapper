import { ArrayOrObject, DseClientOptions, QueryOptions, types } from "cassandra-driver";

export class Client {
    constructor(
        clientName: string, 
        keyspace: string, 
        clientDataCenter: string, 
        clientOptions: DseClientOptions, 
        emiiter?: any,
    );

    connect(): Promise<void | Error>;
    
    execute(query: string, params?: ArrayOrObject, queryOptions?: QueryOptions): Promise<types.ResultSet | Error>;
    
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
}
