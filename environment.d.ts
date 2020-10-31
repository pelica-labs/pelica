declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "development" | "production";

    NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN: string;
    MAPBOX_SECRET_TOKEN: string;

    AWS_KEY: string;
    AWS_SECRET: string;

    AWS_S3_REGION: string;
    AWS_S3_BUCKET: string;

    NEXT_PUBLIC_FULLSTORY_ORG_ID: string;

    NEXT_PUBLIC_SENTRY_DSN: string;

    [key: string]: never;
  }
}
