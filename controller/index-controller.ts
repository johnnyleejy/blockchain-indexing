import { Request, Response } from 'express';
import { indexingService } from '../app';
import { rollbackBlockByHeightEvent } from '../services/event-store-service';
import { PublishingService } from '../services/publisher-service';
import blocksJSON from '../input/200.json'

const publishingService = new PublishingService(blocksJSON);

export const getBlocks = async (req: Request, res: Response) => {
    const maxHeight = req.query.maxHeight;
    const blocks = await indexingService.getAllBlocksService();

    if (blocks !== null) {
        if (maxHeight) {
            const index = blocks.findIndex(x => x["height"] === Number(maxHeight));
            res.status(200).json(blocks.slice(index, blocks.length));
        }
        else {
            res.status(200).json(blocks);
        }
    }
    else {
        res.status(404).json({
            Message: "No blocks found"
        });
    }
}

export const getBlockByHash = async (req: Request, res: Response) => {
    const hash = req.params.hash;
    const block = await indexingService.getBlockByHashService(hash);
    if (block !== null) {
        res.status(200).json(JSON.parse(block));
    }
    else {
        res.status(404).json({
            Message: "No block with the specified hash found!"
        });
    }
}

export const getBlockTransactions = async (req: Request, res: Response) => {
    const key = req.params.key;
    const blocks = await indexingService.getAllBlocksService();
    if (blocks !== null) {
        if (Number(key) || key === "0") {
            // Find transaction for height
            const height = Number(key);
            const block = await indexingService.getBlockByHeightService(height.toString());
            if (block !== null) {
                const transactions = JSON.parse(block)["tx"];
                res.status(200).json(transactions);
            }
            else {
                res.status(404).json({
                    Message: `Block with height ${Number(height)} could not be found!`
                });
            }
        }
        else {
            // Find transactions for address
            const transactions = await indexingService.getAddressTransactionsService(key);
            if (transactions !== null) {
                res.status(200).json(JSON.parse(transactions));
            }
            else {
                res.status(404).json({
                    Message: "No transactions for this address could not be found!"
                });
            }
        }
    }
    else {
        res.status(404).json({
            Message: "Your transaction could not be found!"
        });
    }
}

export const invalidateBlock = async (req: Request, res: Response) => {
    const height = req.params.height;
    const block = await indexingService.getBlockByHeightService(height);
    if (block !== null) {
        await publishingService.publishInvalidateBlockEvent(JSON.parse(block));
        res.status(200).json({
            Message: `Block height ${Number(height)} invalidated`
        });
    }
    else {
        res.status(404).json({
            Message: "Cannot find block!"
        });
    }
}

export const rollBack = async (req: Request, res: Response) => {
    const height = req.params.height;
    await rollbackBlockByHeightEvent(Number(height));
    res.status(200).json({
        Message: `Rolled back block ${height}`
    });
}
