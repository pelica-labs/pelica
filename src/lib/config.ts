export const getEnv = (name: string, value: string): string => {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}.\nHead to https://www.notion.so/Vault-ea433e084af8493ebff86a8df73f34a0 for an up to date local environment file.`
    );
  }

  return value;
};

/**
 * AWS environment variables are prefixed with `OMANYD` for 2 reasons:
 * - Automatic configuration required by `next-auth-dynamodb > omanyd`
 * - Avoid name clash with standard AWS_* variables on Vercel
 */

type AwsCredentials = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export const getAwsCredentials = (): AwsCredentials => {
  return {
    region: getEnv("OMANYD_AWS_REGION", process.env.OMANYD_AWS_REGION),
    accessKeyId: getEnv("OMANYD_AWS_ACCESS_KEY_ID", process.env.OMANYD_AWS_ACCESS_KEY_ID),
    secretAccessKey: getEnv("OMANYD_AWS_SECRET_ACCESS_KEY", process.env.OMANYD_AWS_SECRET_ACCESS_KEY),
  };
};
