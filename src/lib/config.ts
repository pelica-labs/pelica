export const getEnv = (name: string, value: string): string => {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}.\nHead to https://www.notion.so/Vault-ea433e084af8493ebff86a8df73f34a0 for an up to date local environment file.`
    );
  }

  return value;
};

/**
 * We use environment variables such as AWS_* in local development.
 * When hosted on Vercel, those variables are reserved, so we fallback to OMANYD_AWS_*.
 *
 * Those variables are also required (with automatic config from env) by `next-auth-dynamodb > omanyd`
 */

type AwsCredentials = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export const getAwsCredentials = (): AwsCredentials => {
  return {
    region: getEnv("AWS_REGION", process.env.AWS_REGION ?? process.env.OMANYD_AWS_REGION),
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID", process.env.AWS_ACCESS_KEY_ID ?? process.env.OMANYD_AWS_ACCESS_KEY_ID),
    secretAccessKey: getEnv(
      "AWS_SECRET_ACCESS_KEY",
      process.env.AWS_SECRET_ACCESS_KEY ?? process.env.OMANYD_AWS_SECRET_ACCESS_KEY
    ),
  };
};
