declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "development" | "production";

    NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN: string;
    MAPBOX_SECRET_TOKEN: string;

    AWS_KEY: string;
    AWS_SECRET: string;

    AWS_S3_REGION: string;
    AWS_S3_BUCKET: string;

    FULLSTORY_ORG_ID: string;

    [key: string]: never;
  }
}
