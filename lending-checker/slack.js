import SlackBolt from "@slack/bolt";
import { lendingPayloadCreate } from "./slack-msg-builder.js";

console.log("🔌 Getting started with Node Slack SDK");

const slackLenderAlert = new SlackBolt.App({
  token: process.env.SLACK_NODE_BOT_TOKEN,
  signingSecret: process.env.SLACK_NODE_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_NODE_APP_TOKEN,
});

const formatHealthFactor = (healthFactor) => {
  if (healthFactor > 10) {
    return "♾️";
  }

  return Number(healthFactor).toFixed(2);
};

export const postMessage = (
  geistFantomHealthFactor,
  aaveAvaxHealthFactor,
  aaveMaticHealthFactor
) =>
  slackLenderAlert.client.chat.postMessage({
    ...lendingPayloadCreate(
      new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" }),
      formatHealthFactor(geistFantomHealthFactor),
      formatHealthFactor(aaveAvaxHealthFactor),
      formatHealthFactor(aaveMaticHealthFactor)
    ),
    channel: "generale",
  });

// Start your app
(async () => {
  await slackLenderAlert.start(process.env.PORT || 3000);
})();
