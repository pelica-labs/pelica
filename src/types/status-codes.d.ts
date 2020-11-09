declare module "status-codes" {
  let statusCodes: {
    [code: number]: {
      message: string;
      status: number;
      name: string;
    };
  };
  export = statusCodes;
}
