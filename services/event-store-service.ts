import { BACKWARDS, END, jsonEvent } from "@eventstore/db-client";
import { client, indexingService } from "../app";
import { EVENT_STORE_STREAM_NAME } from "../Constants/constants";
import { BlockAddedEvent } from "../models/block-added-event";
import { BlockInvalidatedEvent } from "../models/block-invalidated-event";

type BlockEvents = BlockAddedEvent | BlockInvalidatedEvent;

export const handleEventStream = async (event: BlockEvents): Promise<void> => {
    const incomingBlock = JSON.parse(JSON.stringify(event.data));
    switch (event.type) {
        case "block-added": {
            // Index and save block to redis cache
            await indexingService.indexBlockService(incomingBlock["block"]);
            // Commit transaction to event store db
            await client.appendToStream(EVENT_STORE_STREAM_NAME, jsonEvent(event));
            break;
        }
        case "block-invalidated": {
            await indexingService.deleteBlockService(incomingBlock["block"]);
            await client.appendToStream(EVENT_STORE_STREAM_NAME, jsonEvent(event));
            break;
        }
        default: {
            break;
        }
    }
}

export const rollbackBlockByHeightEvent = async (height: number): Promise<void> => {
    const events = client.readStream<BlockEvents>(EVENT_STORE_STREAM_NAME, {
        fromRevision: END,
        direction: BACKWARDS
        });
    for await (const { event } of events) {
        const currentBlock = JSON.parse(JSON.stringify(event?.data));
        // Rollback latest state for block
        if (currentBlock["block"]["height"] === height){
            switch (event?.type) {
                case "block-added": {
                    // Undo adding of block
                    await indexingService.deleteBlockService(currentBlock["block"]);
                    break;
                }
                case "block-invalidated": {
                    // Undo invalidating of block
                    await indexingService.indexBlockService(currentBlock["block"]);
                    // Sort
                    break;
                }
                default: {
                    break;
                }
            }
            break;
        }
    }
}