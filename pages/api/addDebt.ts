import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db('coffee');
      
      const { userId, debtorName, amount } = req.body;

      if (!userId || !debtorName || amount === undefined) {
        return res.status(400).json({ error: '모든 필드가 필요합니다' });
      }

      const result = await db.collection('coffee').updateOne(
        { _id: new ObjectId(userId) },
        // @ts-ignore
        { $push: { debt: { name: debtorName, amount } } }
      );

      if (result.modifiedCount === 1) {
        res.status(200).json({ message: 'debt가 성공적으로 추가되었습니다' });
      } else {
        res.status(404).json({ error: '사용자를 찾을 수 없거나 업데이트에 실패했습니다' });
      }
    } catch (error) {
      console.error('debt 추가 중 오류:', error);
      res.status(500).json({ error: '데이터베이스에 debt 추가 중 오류 발생' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}