import express from 'express'
import { Request, Response } from 'express';
import blockRouter from './routes/index-routes';
import { PublishingService } from './services/publisher-service';
import { subscribeIndexBlocksEvent, subscribeInvalidateBlockEvent } from './services/subscriber-service';
import { EventStoreDBClient } from '@eventstore/db-client';
import * as redis from 'redis'
import { IndexingService } from './services/indexing-service';
import blocksJSON from './input/200.json'

export const client = EventStoreDBClient.connectionString("esdb://localhost:2113?tls=false");
export const subscriber = redis.createClient();
export const publisher = redis.createClient();
export const indexingService = new IndexingService();
export const publishingService = new PublishingService(blocksJSON);

const app = express();

app.use('/api/blocks', blockRouter);

app.use((req: Request, res: Response) => {
    res.status(404).json({
        Message: "Url does not exist!"
    })
});

export const server = app.listen(5000, () => {
    console.log("App started");
});

// 1. Subscribe and index incoming blocks
subscribeIndexBlocksEvent();

// 2. Subscibe for any invalidated blocks
subscribeInvalidateBlockEvent();

// 3. Read and publish 200.json
publishingService.publishIndexBlocksEvent();
