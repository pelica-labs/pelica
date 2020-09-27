import { NextApiHandler } from "next";

const Hello: NextApiHandler = (req, res) => {
  res.statusCode = 200;
  res.json({ name: "John Doe" });
};

export default Hello;
