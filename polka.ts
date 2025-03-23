// Import
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from 'bn.js';

const wsProvider = new WsProvider('wss://rpc.polkadot.io');
const api = await ApiPromise.create({ provider: wsProvider });

// Do something
console.log(api.genesisHash.toHex());

// Create alice (carry-over from the keyring section)
const alice = '15GcsrsueKgDRR22ChjZ6DG3o3iu2WwuVpJbvVVK9rL152X9';

// Retrieve the chain & node information via rpc calls
const [chain, nodeName, nodeVersion] = await Promise.all([
	api.rpc.system.chain(),
	api.rpc.system.name(),
	api.rpc.system.version(),
]);

console.log(
	`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
);
// Make a transfer from Alice to BOB, waiting for inclusion
const unsub = await api.tx.balances
	.transferAllowDeath(
		'129TNhyUdwvfePh6oBjRLUMVdwYEatxDfyFRENWCEXYJghZd',
		new BN(1000000000000000)
	)
	.signAndSend(alice, (result) => {
		console.log(`Current status is ${result.status}`);

		if (result.status.isInBlock) {
			console.log(
				`Transaction included at blockHash ${result.status.asInBlock}`
			);
		} else if (result.status.isFinalized) {
			console.log(
				`Transaction finalized at blockHash ${result.status.asFinalized}`
			);
			unsub();
		}
	});
