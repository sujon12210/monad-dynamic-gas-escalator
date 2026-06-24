const { ethers } = require("ethers");
require("dotenv").config();

class MonadGasEscalator {
    constructor() {
        this.monitoredTransactions = new Map();
        this.escalationIntervalBlocks = 3;
    }

    /**
     * Registers a critical transaction into the automated evaluation loop.
     */
    trackTransaction(txHash, initialPriorityFee, storageTarget) {
        console.log(`[Escalator Ingest] Tracking TX: ${txHash.slice(0, 16)}... | Initial Priority: ${initialPriorityFee} Gwei`);
        this.monitoredTransactions.set(txHash, {
            hash: txHash,
            currentPriorityFee: initialPriorityFee,
            storageTarget: storageTarget,
            blocksPending: 0
        });
    }

    /**
     * Simulates evaluation steps executed on every inbound network block confirmation.
     */
    evaluatePendingTxs(currentBlockNumber) {
        console.log(`\n--- Evaluating Pending Transactions for Block #${currentBlockNumber} ---`);

        this.monitoredTransactions.forEach((tx, hash) => {
            tx.blocksPending++;
            console.log(` -> TX: ${hash.slice(0, 12)}... has been pending for ${tx.blocksPending} blocks.`);

            // Escalate fees if transaction is stuck beyond the defined block limit
            if (tx.blocksPending >= this.escalationIntervalBlocks) {
                const escalatedFee = Math.ceil(tx.currentPriorityFee * 1.5);
                console.warn(` [ALERT] Transaction stalling detected on target account slot [${tx.storageTarget}].`);
                console.log(` [Action] Broadcasting replacement transaction payload with escalated priority fee: ${escalatedFee} Gwei.`);
                
                // Update transaction state metrics inside the local tracking map
                tx.currentPriorityFee = escalatedFee;
                tx.blocksPending = 0;
            }
        });
    }
}

const escalator = new MonadGasEscalator();

// Mock out a critical transaction targeting a highly contested liquidity pool storage slot
escalator.trackTransaction("0x3a91b5f2200000000000000000000000000000000000000000000000000042a1", 10, "0xContestedAMM_PoolSlot");

// Simulate sequential network blocks to evaluate processing workflows
escalator.evaluatePendingTxs(12001);
escalator.evaluatePendingTxs(12002);
escalator.evaluatePendingTxs(12003); // Reaches threshold, triggers step-wise fee calculation

module.exports = MonadGasEscalator;
