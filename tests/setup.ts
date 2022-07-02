import { server, publisher, subscriber, indexingService, publishingService } from "../app"
import testBlocks from "./test-files/test-blocks.json";

beforeAll(async ()=> {
    // Use test blocks instead of 200.json
    publishingService.blocks = testBlocks;
})

afterAll(async () => {
    // Close connections
    await subscriber.quit();
    await publisher.quit();
    await indexingService.mainClient.quit();
    await server.close();
});
