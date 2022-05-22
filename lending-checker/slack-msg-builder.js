const healthFactorEmoji = (healthFactor) => {
  if (healthFactor < 1.5) {
    return ":red_circle:";
  }
  if (healthFactor < 2) {
    return ":large_yellow_circle:";
  }

  return ":large_green_circle:";
};

export const lendingPayloadCreate = (
  currentDate,
  healthFactorGeist,
  healthFactoryAave
) => ({
  message: "Daily lending update!",
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*The daily (${currentDate}) lending status is here!*`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Geist*\n Health factor: ${healthFactorGeist} \n Status: ${healthFactorEmoji(
          healthFactorGeist
        )}`,
      },
      accessory: {
        type: "image",
        image_url:
          "https://285497806-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-Mkx9wLd-0NnLSueQjY1%2F-MlK5lz5UdHOi6L5TAHK%2F-MlKAOwHSIRlF1TdBDfD%2Fimage.png?alt=media&token=11893e8c-2715-4d23-aa58-2e230668e1bd",
        alt_text: "geist",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Aave* \n Health factor: ${healthFactoryAave} \n Status: ${healthFactorEmoji(
          healthFactoryAave
        )}`,
      },
      accessory: {
        type: "image",
        image_url:
          "https://external-content.duckduckgo.com/iu/?u=https://www.blocktrainer.de/wp-content/uploads/logos/aave.png&f=1&nofb=1",
        alt_text: "alt text for image",
      },
    },
    {
      type: "divider",
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Go to geist",
          },
          value: "geist_button",
          url: "https://geist.finance/dashboard",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Go to aave",
          },
          value: "aave_button",
          url: "https://app.aave.com/?marketName=proto_avalanche_v3",
        },
      ],
    },
  ],
});
