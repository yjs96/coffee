import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db('coffee');

      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: '이름이 필요합니다' });
      }

      const newUser = {
        name,
        debt: [],
      };

      const result = await db.collection('coffee').insertOne(newUser);

      res.status(201).json({ _id: result.insertedId, ...newUser });
    } catch (error) {
      console.error('사용자 추가 중 오류:', error);
      res
        .status(500)
        .json({ error: '데이터베이스에 사용자 추가 중 오류 발생' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
