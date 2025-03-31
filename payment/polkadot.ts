import { ApiPromise } from '@polkadot/api';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export type TransactionStatus =
	| 'idle'
	| 'preparing'
	| 'pending'
	| 'success'
	| 'error';

export interface TransactionState {
	status: TransactionStatus;
	message: string;
	hash?: string;
	blockHash?: string;
	timestamp?: number;
}

export type TransactionUpdateCallback = (state: TransactionState) => void;

/**
 * Send a payment using Polkadot JS API
 *
 * @param api The Polkadot API instance
 * @param account The selected account to send from
 * @param recipient The recipient address
 * @param amount The amount to send (in DOT)
 * @param updateState Callback to update transaction state
 * @returns A promise resolving when the transaction is submitted
 */
export async function sendPayment(
	api: ApiPromise,
	account: InjectedAccountWithMeta,
	recipient: string,
	amount: string,
	updateState: TransactionUpdateCallback
): Promise<() => void> {
	if (!api) {
		updateState({
			status: 'error',
			message: 'API not connected. Please refresh the page and try again.',
		});
		throw new Error('API not connected');
	}

	updateState({
		status: 'preparing',
		message: 'Preparing your transaction...',
	});

	try {
		// Convert the amount from DOT to Planck
		// For Polkadot, 1 DOT = 10^10 Planck
		const amountInPlanck = BigInt(parseFloat(amount) * 10000000000);

		const injector = await web3FromAddress(account.address);

		updateState({
			status: 'pending',
			message:
				'Transaction pending. Please sign the transaction in your wallet extension.',
		});

		const unsub = await api.tx.balances
			.transferKeepAlive(recipient, amountInPlanck)
			.signAndSend(account.address, { signer: injector.signer }, (result) => {
				console.log(`Current status is ${result.status}`);

				if (result.status.isInBlock) {
					const blockHash = result.status.asInBlock.toString();
					updateState({
						status: 'pending',
						message: `Transaction included in block ${blockHash.slice(
							0,
							10
						)}...`,
						hash: result.txHash.toString(),
						blockHash: blockHash,
					});
				} else if (result.status.isFinalized) {
					const finalizedHash = result.status.asFinalized.toString();
					console.log(result);
					updateState({
						status: 'success',
						message: 'Transaction successful!',
						hash: result.txHash.toString(),
						blockHash: finalizedHash,
						timestamp: Date.now(),
					});
					unsub();
				} else if (result.isError) {
					updateState({
						status: 'error',
						message: `Transaction failed: ${
							result.dispatchError?.toString() || 'Unknown error'
						}`,
					});
					unsub();
				}
			});

		// Return the unsubscribe function
		return unsub;
	} catch (error: any) {
		console.error('Payment failed:', error);
		updateState({
			status: 'error',
			message: `Error: ${error.message || 'Unknown error occurred'}`,
		});
		throw error;
	}
}

/**
 * Set up the Polkadot API connection
 *
 * @param provider The WebSocket provider instance
 * @returns A promise resolving to connection info
 */
export async function setupApiConnection(api: ApiPromise) {
	try {
		// Retrieve the chain & node information via rpc calls
		const [chain, nodeName, nodeVersion] = await Promise.all([
			api.rpc.system.chain(),
			api.rpc.system.name(),
			api.rpc.system.version(),
		]);

		return {
			chain: chain.toString(),
			nodeName: nodeName.toString(),
			nodeVersion: nodeVersion.toString(),
		};
	} catch (error) {
		console.error('Failed to get chain info:', error);
		throw error;
	}
}
