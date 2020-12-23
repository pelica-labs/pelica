import { WebClient } from "@slack/web-api";
import { User } from "next-auth";

const slack = new WebClient(process.env.SLACK_ACCESS_TOKEN);

export const notifyUserCreated = async (user: User): Promise<void> => {
  await slack.chat.postMessage({
    channel: "C01H2QT3GS3", // #new-users
    text: `New user signup · ${user.name}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "New user signup!",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${user.name} · ${user.email}`,
        },
        accessory: {
          type: "image",
          image_url: user.image,
          alt_text: user.name,
        },
      },
    ],
  });
};
