export const getEnv = (name: string, value: string): string => {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}.\nHead to https://www.notion.so/Vault-ea433e084af8493ebff86a8df73f34a0 for an up to date local environment file.`
    );
  }

  return value;
};
