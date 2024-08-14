import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'DELETE') {
    try {
      const client = await clientPromise;
      const db = client.db('coffee');

      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다' });
      }

      const result = await db
        .collection('coffee')
        .deleteOne({ _id: new ObjectId(userId) });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: '사용자가 성공적으로 삭제되었습니다' });
      } else {
        res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
      }
    } catch (error) {
      console.error('사용자 삭제 중 오류:', error);
      res
        .status(500)
        .json({ error: '데이터베이스에서 사용자 삭제 중 오류 발생' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
