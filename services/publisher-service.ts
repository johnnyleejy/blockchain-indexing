import {publisher, subscriber} from "../app"
import { INDEX_BLOCK_TOPIC, INVALIDATE_BLOCK_TOPIC } from '../Constants/constants';

export class PublishingService{
    blocks: any;

    constructor(inputBlocks: any){
        this.blocks = inputBlocks;
    }

    publishIndexBlocksEvent = async () => {
        await publisher.connect();
        await subscriber.connect();
    
        for (const block in this.blocks) {
            const currentBlock = this.blocks[block];
            await publisher.publish(INDEX_BLOCK_TOPIC, JSON.stringify(currentBlock));
        }
    }
    
    publishInvalidateBlockEvent = async(block: any) => {
        await publisher.publish(INVALIDATE_BLOCK_TOPIC, JSON.stringify(block));
    }
}
