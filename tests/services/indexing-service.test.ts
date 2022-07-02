import { ADDRESS_INDEX_KEY, BLOCKS_KEY, HASH_INDEX_KEY, HEIGHT_INDEX_KEY } from "../../Constants/constants";
import testBlocks from "../test-files/test-blocks.json";
import { indexingService } from "../../app"

describe('indexing-service', () => {

    test('indexBlockHeight and getBlockByHeight success', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];

        // Act
        await indexingService.indexBlockHeight(incomingBlock);
        const expected = await indexingService.getBlockByHeightService(incomingBlock["height"].toString());
        const result = await indexingService.mainClient.get(`${HEIGHT_INDEX_KEY}${incomingBlock["height"]}`);

        // Assert
        expect(result).toEqual(expected);
    });

    test('indexBlockHash and getBlockByHashsuccess', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];

        // Act
        await indexingService.indexBlockHash(incomingBlock);
        const expected = await indexingService.getBlockByHashService(incomingBlock["hash"].toString());
        const result = await indexingService.mainClient.get(`${HASH_INDEX_KEY}${incomingBlock["hash"]}`);

        // Assert
        expect(result).toEqual(expected);
    });

    test('indexBlock success', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];

        // Act
        await indexingService.indexBlockService(incomingBlock);
        const result = await indexingService.getBlockByHashService(incomingBlock["hash"].toString());

        // Assert
        expect(result).toEqual(JSON.stringify(incomingBlock));
    });

    test('deleteBlockService success', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];
        await indexingService.indexBlockService(incomingBlock);

        // Act
        await indexingService.deleteBlockService(incomingBlock);
        const result = await indexingService.getBlockByHashService(incomingBlock["hash"].toString());


        // Assert
        expect(result).toBeNull();
    });

    test('getAllBlocksService success', async () => {
        // Arrange
        const incomingBlock = testBlocks[0];
        await indexingService.mainClient.lPush(BLOCKS_KEY, JSON.stringify(incomingBlock));

        // Act
        const result = await indexingService.getAllBlocksService();

        // Assert
        expect(result.length).toEqual(1);
    });

    test('indexAddressTransactions and getAddressTransactionsService success', async () => {
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

    beforeEach(() => {
        indexingService.mainClient.flushAll();
    });

    afterEach(() => {
        indexingService.mainClient.flushAll();
    });
});


