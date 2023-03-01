import {
  formatFromWei,
  getAaveAvaxData,
  getAaveMaticData,
  getGeistData,
} from "./contracts/blockchain-connect.js";
import { postMessage } from "./slack.js";

export default async function handler(){
  console.log("⚡️ The lend checker app is running!");

  console.time('collectData')
  const [myGeistData, myAaveAvaxData, myAaveMaticData] = await Promise.all([
    getGeistData(),
    getAaveAvaxData(),
    getAaveMaticData(),
  ]);
  console.timeEnd('collectData')
  console.debug("Retrieved data", {
    myGeistData,
    myAaveAvaxData,
    myAaveMaticData,
  });
  const geistFantomHealthFactor = formatFromWei(myGeistData.healthFactor);
  const aaveAvaxHealthFactor = formatFromWei(myAaveAvaxData.healthFactor);
  const aaveMaticHealthFactor = formatFromWei(myAaveMaticData.healthFactor);

  console.debug("Health factor retrieved");

  console.time('postMessage')
  await postMessage(
    geistFantomHealthFactor,
    aaveAvaxHealthFactor,
    aaveMaticHealthFactor
  );
  console.timeEnd('postMessage')
  console.debug("Posted data");

  return { status: "HEALTHyyy" };
}
