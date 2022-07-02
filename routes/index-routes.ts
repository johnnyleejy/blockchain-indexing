import express from 'express'
import { getBlocks, getBlockByHash, getBlockTransactions, invalidateBlock, rollBack } from '../controller/index-controller';

const blockRouter = express.Router();

blockRouter.get('/', getBlocks);

blockRouter.get('/rollback/:height', rollBack);

blockRouter.get('/:hash', getBlockByHash);

blockRouter.get('/:key/transactions', getBlockTransactions);

blockRouter.get('/invalidate/:height', invalidateBlock);

export default blockRouter;
