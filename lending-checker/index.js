import Fastify from "fastify";
import {
  formatFromWei,
  getAaveData,
  getGeistData,
} from "./contracts/blockchain-connect.js";
import { postMessage } from "./slack.js";

const fastify = Fastify({
  logger: true,
});

export default async function handler(request, response) {
  console.log("⚡️ The lend checker app is running!");

  const [myGeistData, myAaveData] = await Promise.all([
    getGeistData(),
    getAaveData(),
  ]);
  console.debug("Retrieved data", { myGeistData, myAaveData });
  const geistHealthFactor = formatFromWei(myGeistData.healthFactor);
  const aaveHealthFactor = formatFromWei(myAaveData.healthFactor);

  postMessage(geistHealthFactor, aaveHealthFactor);
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
