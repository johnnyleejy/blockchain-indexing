import { jsonEvent } from "@eventstore/db-client";
import { BlockAddedEvent } from "../models/block-added-event";
import { BlockInvalidatedEvent } from "../models/block-invalidated-event";
import { handleEventStream } from "./event-store-service";
import {subscriber} from "../app"
import { INDEX_BLOCK_TOPIC, INVALIDATE_BLOCK_TOPIC } from "../Constants/constants";

export const subscribeIndexBlocksEvent = async () => {
    await subscriber.subscribe(INDEX_BLOCK_TOPIC, (message) => {
        const incomingBlock = JSON.parse(message);
        const event = jsonEvent<BlockAddedEvent>({
            type: "block-added",
            data: {
                block: incomingBlock
            },
        });
        // Persist event to event store db
        handleEventStream(event);
    });
}

export const subscribeInvalidateBlockEvent = async () => {
    await subscriber.subscribe(INVALIDATE_BLOCK_TOPIC, (message) => {
        const invalidatedBlock = JSON.parse(message);

        const event = jsonEvent<BlockInvalidatedEvent>({
            type: "block-invalidated",
            data: {
                block: invalidatedBlock
            },
        });
        // Persist event to event store db
        handleEventStream(event);
    });
}
