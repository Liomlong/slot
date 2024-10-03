import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { tgId, pointsWon, usdtWon } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { tgId: tgId },
        data: {
          points: { increment: pointsWon },
          usdt: { increment: usdtWon },
        },
      });

      res.status(200).json({ newPoints: updatedUser.points, newUsdt: updatedUser.usdt });
    } catch (error) {
      console.error('Error updating user data:', error);
      res.status(500).json({ error: 'Failed to update user data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}