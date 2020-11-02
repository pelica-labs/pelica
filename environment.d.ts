declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "development" | "production";

    NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN: string;
    MAPBOX_SECRET_TOKEN: string;

    OMANYD_AWS_REGION: string;
    OMANYD_AWS_ACCESS_KEY_ID: string;
    OMANYD_AWS_SECRET_ACCESS_KEY: string;

    AWS_S3_BUCKET: string;

    NEXT_PUBLIC_FULLSTORY_ORG_ID: string;

    NEXT_PUBLIC_SENTRY_DSN: string;

    COOKIE_PASSWORD: string;

    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    [key: string]: never;
  }
}
