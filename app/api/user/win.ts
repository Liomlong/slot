import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { tgId, usdtWon, pointsWon } = req.body;

  if (!tgId || typeof usdtWon !== 'number' || typeof pointsWon !== 'number') {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const result = await usersCollection.findOneAndUpdate(
      { tgId: tgId },
      { 
        $inc: { 
          points: pointsWon,
          usdt: usdtWon
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      newPoints: result.value.points,
      newUsdt: result.value.usdt
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}