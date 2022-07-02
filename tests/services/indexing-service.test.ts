import { ADDRESS_INDEX_KEY, BLOCKS_KEY, HASH_INDEX_KEY, HEIGHT_INDEX_KEY } from "../../constants/constants";
import testBlocks from "../test-files/test-blocks.json";
import { indexingService } from "../../app"
import { handleEventStream, rollbackBlockByHeightEvent } from "../../services/event-store-service";
import { jsonEvent } from "@eventstore/db-client";
import { BlockInvalidatedEvent } from "../../models/block-invalidated-event";
import { BlockAddedEvent } from "../../models/block-added-event";

describe('indexing-service', () => {

    test('able to index block by height and retrieve it by height successfully', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];

        // Act
        await indexingService.indexBlockHeight(incomingBlock);
        const expected = await indexingService.getBlockByHeightService(incomingBlock["height"].toString());
        const result = await indexingService.mainClient.get(`${HEIGHT_INDEX_KEY}${incomingBlock["height"]}`);

        // Assert
        expect(result).toEqual(expected);
    });

    test('able to index block by hash and retrieve it by hash successfully', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];

        // Act
        await indexingService.indexBlockHash(incomingBlock);
        const expected = await indexingService.getBlockByHashService(incomingBlock["hash"].toString());
        const result = await indexingService.mainClient.get(`${HASH_INDEX_KEY}${incomingBlock["hash"]}`);

        // Assert
        expect(result).toEqual(expected);
    });

    test('able to index block successfully', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];

        // Act
        await indexingService.indexBlockService(incomingBlock);
        const result = await indexingService.getBlockByHashService(incomingBlock["hash"].toString());

        // Assert
        expect(result).toEqual(JSON.stringify(incomingBlock));
    });

    test('able to delete block successfully', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];
        await indexingService.indexBlockService(incomingBlock);

        // Act
        await indexingService.deleteBlockService(incomingBlock);
        const result = await indexingService.getBlockByHashService(incomingBlock["hash"].toString());


        // Assert
        expect(result).toBeNull();
    });

    test('able to retrieve all blocks successfully', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];
        await indexingService.mainClient.lPush(BLOCKS_KEY, JSON.stringify(incomingBlock));

        // Act
        const result = await indexingService.getAllBlocksService();

        // Assert
        expect(result.length).toEqual(1);
    });

    test('able to index address transactions and retrieve transactions successfully', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];
        const blockAddress = incomingBlock.tx[0].vout[0].scriptPubKey.addresses![0];

        // Act
        await indexingService.indexAddressTransactions(incomingBlock);
        const expected = await indexingService.mainClient.get(`${ADDRESS_INDEX_KEY}${blockAddress}`);
        const result = await indexingService.getAddressTransactionsService(blockAddress);

        // Assert
        expect(result).toEqual(expected);
    });

    test('able to invalidate block successfully', async () => {
        // Arrange
        const invalidatedBlock = testBlocks[0];
        const event = jsonEvent<BlockInvalidatedEvent>({
            type: "block-invalidated",
            data: {
                block: JSON.parse(JSON.stringify(invalidatedBlock))
            },
        });
        
        // Act
        await handleEventStream(event)
        const result = await indexingService.getBlockByHashService(invalidatedBlock["hash"].toString());

        // Assert
        expect(result).toBeNull();
    });

    test('able to rollback block-added event successfully', async () => {
        // Arrange
        const rollbackBlock = testBlocks[0];
        // Add block first
        const event = jsonEvent<BlockAddedEvent>({
            type: "block-added",
            data: {
                block: JSON.parse(JSON.stringify(rollbackBlock))
            },
        });
        await handleEventStream(event)

        // Act
        await rollbackBlockByHeightEvent(rollbackBlock["height"]);
        const result = await indexingService.getBlockByHeightService(String(rollbackBlock["height"]));

        // Assert
        expect(result).toBeNull();
    });

    test('able to rollback block-invalidated event successfully', async () => {
        // Arrange
        const rollbackBlock = testBlocks[0];
        const event = jsonEvent<BlockInvalidatedEvent>({
            type: "block-invalidated",
            data: {
                block: JSON.parse(JSON.stringify(rollbackBlock))
            },
        });
        // Invalidate rollbackBlock
        await handleEventStream(event);
        
        // Act
        await rollbackBlockByHeightEvent(rollbackBlock["height"]);
        const result = await indexingService.getBlockByHeightService(String(rollbackBlock["height"]));

        // Assert
        expect(result).toEqual(JSON.stringify(rollbackBlock));
    });


    beforeEach(() => {
        indexingService.mainClient.flushAll();
    });

    afterEach(() => {
        indexingService.mainClient.flushAll();
    });
});


