import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = await clientPromise;
    const db = client.db('coffee');
    const coffeeList = await db.collection('coffee').find().toArray();
    res.json(coffeeList);
  } catch (e) {
    console.error;
  }
};
