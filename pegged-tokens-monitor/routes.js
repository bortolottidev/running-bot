import S from "fluent-json-schema";

const convertIntoFtm = (value) => value / Math.pow(10, 18);
const formatValue = (value, type) =>
  type.startsWith("uint") ? convertIntoFtm(value) : value;

const peggedTokensAvailable = [
  { token: "pFTM", peg: ["FTM", "WFTM"] },
  { token: "PAE", peg: ["MIM"] },
  { token: "TOMB", peg: ["FTM", "WFTM"] },
  { token: "LUNA", peg: ["MIM", "USDT"] },
];

async function routes(fastify, options) {
  fastify.get("/transaction/:txId", async (request) => {
    const { txId } = request.params;
    const data = await fastify.getDataFromWeb3(txId);
    // return JSON.stringify(
    //   data,
    //   undefined,
    //   2
    // );
    return data;
  });

  fastify.post("/save/:txId", async (request) => {
    const { txId } = request.params;
    const fetchedFtmData = await fastify.fetchFantomTransaction(txId);
    const fetchedAvaxData = await fastify.fetchAvaxTransaction(txId);
    if (!fetchedAvaxData && !fetchedFtmData) {
      throw new Error("Transaction not found");
    }
    const [firstTransaction] = (fetchedFtmData || fetchedAvaxData).items;

    const enrichedDetails = ({ decoded }) =>
      decoded
        ? {
            chainDetails: decoded.params,
            type: decoded.name,
            ...decoded.params.reduce(
              (acc, curr) => ({
                ...acc,
                [curr.name]: formatValue(curr.value, curr.type),
              }),
              {}
            ),
          }
        : { chainDetails: null, type: null };

    const decodedTransactions = firstTransaction["log_events"].map((e) => ({
      token: e.sender_contract_ticker_symbol,
      time: e.block_signed_at,
      contract: e.sender_name,
      contractAddress: e.sender_address,
      ...enrichedDetails(e),
    }));

    const replaceDocPredicate = { txId };

    const transactions = fastify.mongo.db.collection("transactions-raw");
    await transactions.replaceOne(
      replaceDocPredicate,
      {
        createdAt: new Date(),
        operations: decodedTransactions,
        txId,
      },
      { upsert: true }
    );

    return decodedTransactions;
  });

  peggedTokensAvailable.forEach(({ token, peg }) => {
    const transactions = fastify.mongo.db.collection("transactions");
    const swaps = fastify.mongo.db.collection(token);

    fastify.log.info(`Adding dynamic route GET /${token}/:txid`);
    fastify.get(
      `/${token}/:txid`,
      {
        schema: {
          query: S.object().prop("valueUsd", S.number()),
        },
      },
      async (request) => {
        const { txId } = request.params;
        const { valueUsd } = request.query;
        const fetchedFtmData = await fastify.fetchFantomTransaction(txId);
        const fetchedAvaxData = await fastify.fetchAvaxTransaction(txId);
        if (!fetchedAvaxData && !fetchedFtmData) {
          throw new Error("Transaction not found");
        }
        const [firstTransaction] = (fetchedFtmData || fetchedAvaxData).items;

        const enrichedDetails = ({ decoded }) =>
          decoded
            ? {
                chainDetails: decoded.params,
                type: decoded.name,
                ...decoded.params.reduce(
                  (acc, curr) => ({
                    ...acc,
                    [curr.name]: formatValue(curr.value, curr.type),
                  }),
                  {}
                ),
              }
            : { chainDetails: null, type: null };

        const decodedTransactions = firstTransaction["log_events"].map((e) => ({
          token: e.sender_contract_ticker_symbol,
          time: e.block_signed_at,
          contract: e.sender_name,
          contractAddress: e.sender_address,
          ...enrichedDetails(e),
        }));
        console.log({ decodedTransactions });

        // e.g. pftm
        const onlyMyTransactionFilter = ({ to, from }) =>
          (to || "").startsWith(process.env.MY_ADDRESS_STARTS_WITH) ||
          (from || "").startsWith(process.env.MY_ADDRESS_STARTS_WITH);
        const peggedToken = decodedTransactions
          .filter(onlyMyTransactionFilter)
          .filter((x) => x.type === "Transfer")
          .find((x) => x.token.toLowerCase() === token.toLowerCase());

        // e.g. ftm
        const mainToken = decodedTransactions
          .filter((l) => l.type === "Transfer")
          .filter(onlyMyTransactionFilter)
          .find((l) =>
            peg.some((p) => p.toLowerCase() === l.token.toLowerCase())
          );

        const isBuy = peggedToken.to.startsWith(process.env.MY_ADDRESS_STARTS_WITH);
        const replaceDocPredicate = { txId };

        if (!mainToken && !valueUsd) {
          throw new Error(
            "Missing pegged token value. You can still complete the transaction with valueUsd query param"
          );
        }
        const mainTokenValue = mainToken ? mainToken.value : valueUsd;
        await swaps.replaceOne(
          replaceDocPredicate,
          {
            txId,
            isBuy,
            [peg[0]]: mainTokenValue,
            [token]: peggedToken.value,
            price: mainTokenValue / peggedToken.value,
          },
          { upsert: true }
        );

        await transactions.replaceOne(
          replaceDocPredicate,
          {
            createdAt: new Date(),
            operations: decodedTransactions,
            txId,
          },
          { upsert: true }
        );

        return decodedTransactions;
      }
    );

    const tokenStatusRequestParams = {
      schema: {
        query: S.object().prop("currentPrice", S.number()),
      },
    };

    fastify.log.info(`Adding dynamic route GET /${token}`);
    fastify.get(`/${token}`, tokenStatusRequestParams, async () => {
      const swapsDone = await swaps.find().toArray();
      const tokenNet = swapsDone
        // lets suppose theres only buy sell no interest
        .reduce(
          (acc, { [token]: value, isBuy }) =>
            acc + (Boolean(isBuy) ? value : -value),
          0
        );
      const token2Net = swapsDone.reduce(
        (acc, { [peg[0]]: value, isBuy }) => acc + (isBuy ? -value : value),
        0
      );

      const peggedBuy = swapsDone
        .filter(({ isBuy }) => Boolean(isBuy))
        .reduce((acc, curr) => acc + curr[peg[0]], 0);
      const tokenBuy = swapsDone
        .filter(({ isBuy }) => Boolean(isBuy))
        .reduce((acc, curr) => acc + curr[token], 0);

      const response = {
        token,
        peg,
        swapsDone,
        avgCost: peggedBuy / tokenBuy,
        [token + "net"]: tokenNet,
        [peg[0] + "net"]: token2Net,
      };

      return JSON.stringify(response, undefined, 2);
    });
  });

  const newEntryJsonSchema = S.object()
    .additionalProperties(false)
    .prop("collection", S.string().enum(["pFTM"]))
    .prop("tx", S.string())
    .prop("time", S.string().format("date-time"))
    .prop("type", S.string().enum(["interest", "buy", "sell"]))
    .prop("ftm", S.number())
    .prop("pftm", S.number())
    .prop("valueIn", S.number())
    .prop("valueOut", S.number())
    .prop("locked", S.number());

  const opts = {
    schema: {
      body: newEntryJsonSchema,
    },
  };
  fastify.post("/", opts, async (request) => {
    const {
      body: { collection, ...entry },
    } = request;
    fastify.log.info("Adding new entry to " + collection);
    const db = fastify.mongo.db.collection(collection);
    const savedEntry = await db.insertOne(entry);
    return savedEntry;
  });
}

export default routes;
