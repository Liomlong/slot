import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { tgId } = req.query;

    if (!tgId) {
      return res.status(400).json({ error: 'tgId is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { tgId: String(tgId) },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        points: user.points,
        usdt: user.usdt,
        spinsLeft: user.spinsLeft,
        lastSpinTime: user.lastSpinTime,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}