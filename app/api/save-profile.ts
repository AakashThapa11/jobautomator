import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, ...profileData } = req.body;
  await prisma.userProfile.upsert({
    where: { userId },
    update: profileData,
    create: { userId, ...profileData },
  });

  res.json({ success: true });
}
