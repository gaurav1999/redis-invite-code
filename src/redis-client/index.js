import { createClient } from 'redis';

let REDIS_CLIENT = null;

export const getConnection = async(url) => {
    if(!!REDIS_CLIENT) return REDIS_CLIENT;
    try {

        const client = createClient(url);
        client.on('error', (err) => {throw err});
        await client.connect();
        REDIS_CLIENT = client;
        return REDIS_CLIENT;

    } catch(error) {
        throw new Error("Client not able to connect" + error.message);
    }
}

