import { NextApiHandler } from "next";

import { redirect } from "~/lib/redirect";
import { impersonate, withApiSession } from "~/lib/session";

const CreateMap: NextApiHandler = withApiSession(async (req, res) => {
  await impersonate(req, req.query.userId as string);

  redirect(res, "/");
});

export default CreateMap;
