# Blockchain-Indexing
This project uses the below **libraries/frameworks**:
1. Redis - I use Redis to mainly cache block indexes and to improve the operations for read operations. I also used Redis pubish/subscribe module to mock the publish and read stream for incoming blocks. This is unnecessary here as I could have used Eventstoredb for the readstream.
2. [Eventstoredb](https://www.eventstore.com/eventstoredb) - For storing and reading event logs. Events stored in this db are imutable. This is used for the event sourcing pattern where indexed blocks are added to the eventstore. The server can also refer back to eventstore to rollback transactions back to their previous state.
3. Express.js - To create APIs for block indexing, reading and invalidating operations  
4. NodeJs
5. Jest - For unit testing
6. Postman - To call the created APIs and verify the indexing and event sourcing workflow

## 1. Setup Guide
1. Clone project
2. Run npm install
3. Run docker-compose up (Image only contains the eventstoredb image)
4. Install and run Redis (I'm using a w)

## 2. How to test
1. 
