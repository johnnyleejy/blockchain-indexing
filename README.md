# Blockchain-Indexing
## Overview
This project uses the below **libraries/frameworks**:
1. Redis - I use Redis mainly for caching block indexes and to improve the operations for read operations. I also used Redis pubish/subscribe module to mock the publish and read stream for incoming blocks. This is unnecessary here as I could have used Eventstoredb for the readstream.
2. [Eventstoredb](https://www.eventstore.com/eventstoredb) - For storing and reading event logs. Events stored in this db are immutable. This is used for the event sourcing pattern where indexed blocks are added to the eventstore. The server can also refer back to Eventstore to rollback transactions back to their previous state.
3. Express.js - To create APIs for block indexing, reading and invalidating operations  
4. NodeJs
5. Jest - For unit testing
6. Postman - To call the created APIs and verify the indexing and event sourcing workflow

## 1. Setup Guide
1. Clone project
2. Run npm install
3. Run docker-compose up (Image only contains the eventstoredb image)
4. After your image is up and running, go to http://localhost:2113/web/index.html#/streams and you should see Eventstoredb's stream dashboard 
5. Install and run Redis (I'm using a Microsoft archived version for Redis found here: https://github.com/microsoftarchive/redis/releases)

## 2. List of APIs
1. http://localhost:5000/api/blocks - Retrieves all current blocks from Redis
2. http://localhost:5000/api/blocks?maxHeight={height} - Retrieves all blocks up to the specified max height
3. http://localhost:5000/api/blocks/{hash} - Retrieves the block with the specified hash
4. http://localhost:5000/api/blocks/{height}/transactions - Retrieves the transactions for the block with the specified height
5. http://localhost:5000/api/blocks/{address}/transactions - Retrieves all transactions for the specified address
6. http://localhost:5000/api/blocks/invalidate/{height} - Invalidates a block with the specified height
7. http://localhost:5000/api/blocks/rollback/{height} - Rolls back a block with the specified height back to its previous state

## 3. Simple end to end flow guide
1. Run npm start and the server will start reading and indexing all 200 blocks from 200.json
2. Open postman and fire a GET request to http://localhost:5000/api/blocks
3. You should see all 200 blocks sorted by the last indexed block first
4. Fire a call to http://localhost:5000/api/blocks?maxHeight=199 and you should see block 199's details
5. Fire a call to http://localhost:5000/api/blocks/de7233400f5eb1dcf96442c5406f42a8c1b2e817d3eaad954474c494bba85cbf and you should see the block for the specified hash
6. Fire a call to http://localhost:5000/api/blocks/199/transactions and you see the transactions for block 199
7. Fire a call to http://localhost:5000/api/blocks/mwsZw8nF7pKxWH8eoKL9tPxTpaFkz7QeLU/transactions and you should see the transactions for the address: mwsZw8nF7pKxWH8eoKL9tPxTpaFkz7QeLU
8. Finally for the rollback part.
9. Start by calling http://localhost:5000/api/blocks/invalidate/199 to invalidate block 199
10. Fire a call to http://localhost:5000/api/blocks?maxHeight=199 and verify that block 199 is no longer there
11. To rollback the invalidation of block 199, fire a call to http://localhost:5000/api/blocks/rollback/199
12. Now, you can call http://localhost:5000/api/blocks?maxHeight=199 again and verify that the transaction is rolled back.

## 4. Suggestions for improving this task
Drop the usage of Redis publish/subscribe as it is not persistent and reliable for streaming. I could use Redis-Streams or even eventstoredb as an alternative as a read stream. I could also use mongodb to store the blocks as mongo can handle heavy read/write operations at scale. Achieve 100% code coverage :X

## 5. Anything that stands out to me
The Address Transaction Index seems extremely complex to me. Until now, I don't have a 100% understand of this concept. Because the address information is nested deep within a block, we have to navigate "deep" into the block to retrieve the address. Maybe I'm missing out something or my understanding for this index is wrong.

## 6. Comments
Maybe can provide additional examples for the address transaction index /api/blocks/{address}/transactions to better illustrate how this works.
