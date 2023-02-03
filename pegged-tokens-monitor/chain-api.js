import fastifyPlugin from "fastify-plugin";

import Web3 from "web3";
const web3 = new Web3("https://rpc.ftm.tools");

async function chainApi(fastify, options) {
  const avaxId = process.env.AVAX_CHAIN_ID || 43114;
  const ftmId = process.env.FTM_CHAIN_ID || 250;
  const apiKey = process.env.COVALENT_API_KEY;

  const fetchTransactionData = (chainId) => async (txId) => {
    const queryParams = Object.entries({
      "quote-currency": "EUR",
      format: "JSON",
      key: apiKey,
    })
      .map(([k, v]) => k + "=" + v)
      .join("&");
    const fetchedResp = await fetch(
      `https://api.covalenthq.com/v1/${chainId}/transaction_v2/${txId}/?${queryParams}`
    );
    const resp = await fetchedResp.json();
    if (fetchedResp.status !== 200) {
      fastify.log.error("Cannot fetch", { resp, chainId });
    }
    return resp.data;
  };

  fastify.decorate("fetchFantomTransaction", fetchTransactionData(ftmId));
  fastify.decorate("fetchAvaxTransaction", fetchTransactionData(avaxId));

  fastify.decorate("getDataFromWeb3", async txId => {
    const transaction = await web3.eth.getTransaction(txId);
    const { blockHash, blockNumber, transactionIndex } = transaction;
    const [transactionFromBlock, block] = await Promise.all([
      web3.eth.getTransactionFromBlock(
        blockHash,
        transactionIndex
      ),
      web3.eth.getBlock(blockNumber),
    ]);
    return {
      txId,
      transaction,
      transactionFromBlock,
      block,
      // value: web3.utils.bytesToHex(web3.utils.hexToString(transaction.input)),
    };
  })
}

export default fastifyPlugin(chainApi);
