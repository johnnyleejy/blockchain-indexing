import { ADDRESS_INDEX_KEY, BLOCKS_KEY, HASH_INDEX_KEY, HEIGHT_INDEX_KEY } from '../constants/constants';
import * as redis from 'redis'

export class IndexingService {
    mainClient: redis.RedisClientType;

    constructor() {
        this.mainClient = redis.createClient();
        (async () => {
            await this.mainClient.connect();
        })();
    }

    deleteBlockService = async (incomingBlock: any) => {
        const blocks = await this.getAllBlocksService();
        const height = incomingBlock["height"];
        const indexToDelete = blocks.findIndex(x => x["height"] === height);
        if (indexToDelete !== -1) {
            // Delete from Blocks list
            await this.mainClient.lSet(BLOCKS_KEY, indexToDelete, "DELETED");
            await this.mainClient.lRem(BLOCKS_KEY, 1, "DELETED");
            // Delete hash
            await this.mainClient.del(`${HASH_INDEX_KEY}${incomingBlock["hash"]}`);
            // Delete height
            await this.mainClient.del(`${HEIGHT_INDEX_KEY}${incomingBlock["height"]}`);
        }
    }

    indexBlockService = async (incomingBlock: any) => {
        // Sort by height
        await this.mainClient.lPush(BLOCKS_KEY, JSON.stringify(incomingBlock));
        await this.indexBlockHash(incomingBlock);
        await this.indexBlockHeight(incomingBlock);
        await this.indexAddressTransactions(incomingBlock);
    }

    getAllBlocksService = async (): Promise<[any]> => {
        const blocks = await this.mainClient.lRange(BLOCKS_KEY, 0, -1);
        const blocksJSON = JSON.parse(JSON.stringify(blocks))
        for (let i = 0; i < blocksJSON.length; i++) {
            const block = blocksJSON[i];
            blocksJSON[i] = JSON.parse(block);
        }
        return blocksJSON;
    }

    getBlockByHashService = async (hash: string) => {
        return await this.mainClient.get(`${HASH_INDEX_KEY}${hash}`);
    }

    getBlockByHeightService = async (height: string) => {
        return await this.mainClient.get(`${HEIGHT_INDEX_KEY}${height}`);
    }

    getAddressTransactionsService = async (address: string) => {
        return await this.mainClient.get(`${ADDRESS_INDEX_KEY}${address}`);
    }

    indexAddressTransactions = async (incomingBlock: any) => {
        const blockTransactions = incomingBlock["tx"];
        for (const transaction of blockTransactions) {
            for (const vout of transaction["vout"]) {
                await this.findAndIndexAddress(vout, transaction);
            }
        }
    }

    findAndIndexAddress = async (vout: any, transaction: any) => {
        if (vout["scriptPubKey"]["addresses"] && vout["scriptPubKey"]["addresses"].length > 0) {
            for (const address of vout["scriptPubKey"]["addresses"]) {
                const addressTransactions = await this.mainClient.get(`Address:${address}`);
                if (addressTransactions !== null) {
                    const addressTransactionArray: [any] = JSON.parse(addressTransactions);
                    if (!addressTransactionArray.includes(transaction)) {
                        // Add subsequent transactions for address
                        addressTransactionArray.push(transaction);
                        await this.mainClient.set(`${ADDRESS_INDEX_KEY}${address}`, JSON.stringify(addressTransactionArray));
                    }
                }
                else {
                    // Add first transaction for address
                    await this.mainClient.set(`${ADDRESS_INDEX_KEY}${address}`, JSON.stringify([transaction]));
                }
            }
        }
    }

    indexBlockHash = async (incomingBlock: any) => {
        await this.mainClient.set(`${HASH_INDEX_KEY}${incomingBlock["hash"]}`, JSON.stringify(incomingBlock));
    }

    indexBlockHeight = async (incomingBlock: any) => {
        await this.mainClient.set(`${HEIGHT_INDEX_KEY}${incomingBlock["height"]}`, JSON.stringify(incomingBlock));
    }
}