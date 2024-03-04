import mysql, { RowDataPacket } from "mysql2/promise";

let pools: {
    user: mysql.Pool,
    wallet: mysql.Pool,
    card: mysql.Pool,
    merchant: mysql.Pool,
    location: mysql.Pool
} 

function init(){

    pools = {
        user: createPool(process.env.DB_NAME_USER as string),
        wallet: createPool(process.env.DB_NAME_WALLET as string),
        card: createPool(process.env.DB_NAME_CARD as string),
        merchant: createPool(process.env.DB_NAME_MERCHANT as string),
        location: createPool(process.env.DB_NAME_LOCATION as string),
    }

}

function createPool(database: string) {

    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    })

}

function getPool(database: string) {

    if (database === process.env.DB_NAME_USER){
        return pools.user;
    } else if (database === process.env.DB_NAME_WALLET){
        return pools.wallet;
    } else if (database === process.env.DB_NAME_CARD){
        return pools.card;
    } else if (database === process.env.DB_NAME_MERCHANT){
        return pools.merchant;
    } else if (database === process.env.DB_NAME_LOCATION){
        return pools.location;
    }

}

async function executeUser(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_USER as string, true, sql, values);
}

async function executeWallet(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_WALLET as string, true, sql, values);
}

async function executeCard(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_CARD as string, false, sql, values);
}

async function executeMerchant(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_MERCHANT as string, false, sql, values);
}

async function executeLocation(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_LOCATION as string, false, sql, values);
}

async function queryUser(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_USER as string, true, sql, values);
}

async function queryWallet(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_WALLET as string, true, sql, values);
}

async function queryCard(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_CARD as string, false, sql, values);
}

async function queryMerchant(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_MERCHANT as string, false, sql, values);
}

async function queryLocation(sql: string, values:any[] = []) {
    return await runScript(process.env.DB_NAME_LOCATION as string, false, sql, values);
}

let pool:{
    [db:string]: mysql.Pool;
}={}

let queryCountMap = new Map<string, number>();

async function runScript(db:string, isExecute:boolean, sql: string, values: any[] = []) {

    try {

        const pool = getPool(db)!;

        const connection = await pool.getConnection();

        let rows:
            | mysql.OkPacket
            | mysql.RowDataPacket[]
            | mysql.ResultSetHeader[]
            | mysql.RowDataPacket[][]
            | mysql.OkPacket[]
            | mysql.ProcedureCallPacket;
        let fields: mysql.FieldPacket[];

        try {
            console.log(`executing SQL:\n${sql}\nvalues:\n[${values}]\n`);

            [rows, fields] = isExecute ? await connection.execute(sql, values) : await connection.query(sql, values);

            return rows as RowDataPacket[];
        } catch (error) {
            throw error;
        } finally {
            connection?.release();
        }
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        
    }
}

export default {
    init,
    executeUser,
    executeWallet,
    executeCard,
    executeMerchant,
    executeLocation,
    queryUser,
    queryWallet,
    queryCard,
    queryMerchant,
    queryLocation,
};
