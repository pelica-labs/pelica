import { NextApiHandler } from "next";

import { impersonate, withApiSession } from "~/core/session";
import { redirect } from "~/lib/redirect";

const CreateMap: NextApiHandler = withApiSession(async (req, res) => {
  await impersonate(req, req.query.userId as string);

  redirect(res, "/");
});

export default CreateMap;
