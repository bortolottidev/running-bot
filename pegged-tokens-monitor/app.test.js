import { test } from "tap";
import build from "./app.js";

test("GET /transaction/:txId", async (t) => {
  const app = build({});

  t.teardown(() => app.close())

  const response = await app.inject({
    method: "GET",
    url: "/transaction/0x28071b1714762d7b533d15a0b191dd369b47f766eeb48f799532edfffd7dc019",
  });

  const body = await response.json(); 
  t.equal(response.statusCode, 200, "it works");
  t.equal(body.txId, "0x28071b1714762d7b533d15a0b191dd369b47f766eeb48f799532edfffd7dc019", "body check");
  t.type(body.transaction, "object", "body check");
  t.type(body.transactionFromBlock, "object", "body check");
  t.type(body.block, "object", "body check");
});

test("POST /save/:txId", async (t) => {
  const app = build({});
  const txId = "0x28071b1714762d7b533d15a0b191dd369b47f766eeb48f799532edfffd7dc019";

  t.teardown(async () => {
    await app.mongo.db.collection("transactions-raw").deleteOne({ txId });
    await app.close()
  })

  const response = await app.inject({
    method: "POST",
    url: "/save/" + txId,
  });

  const body = await response.json(); 
  const counter = await app.mongo.db.collection("transactions-raw").count({ txId });
  t.equal(response.statusCode, 200, "it works");
  t.equal(body instanceof Array, true, "body type check");
  t.equal(body.length, 5, "elements received check");
  t.equal(counter, 1, "element saved is 1");
});
