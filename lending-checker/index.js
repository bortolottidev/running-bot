import Fastify from "fastify";
import {
  formatFromWei,
  getAaveAvaxData,
  getAaveMaticData,
  getGeistData,
} from "./contracts/blockchain-connect.js";
import { postMessage } from "./slack.js";

const fastify = Fastify({
  logger: true,
});

export default async function handler(request, response) {
  console.log("⚡️ The lend checker app is running!");

  const [myGeistData, myAaveAvaxData, myAaveMaticData] = await Promise.all([
    getGeistData(),
    getAaveAvaxData(),
    getAaveMaticData(),
  ]);
  console.debug("Retrieved data", {
    myGeistData,
    myAaveAvaxData,
    myAaveMaticData,
  });
  const geistFantomHealthFactor = formatFromWei(myGeistData.healthFactor);
  const aaveAvaxHealthFactor = formatFromWei(myAaveAvaxData.healthFactor);
  const aaveMaticHealthFactor = formatFromWei(myAaveMaticData.healthFactor);

  console.debug([myAaveMaticData.healthFactor]);

  postMessage(
    geistFantomHealthFactor,
    aaveAvaxHealthFactor,
    aaveMaticHealthFactor
  );
  console.debug("Posted data");

  return { status: "HEALTHyyy" };
  /*return response.statius(200).json({
    body: JSON.stringify({ msg: "HEALTHyyy" }),
  });*/
}

fastify.get("/", handler);

fastify.listen(process.env.PORT || 3211, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});
