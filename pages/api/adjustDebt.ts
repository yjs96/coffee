import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db('coffee');

      const { userId, debtorName, adjustment } = req.body;

      if (!userId || !debtorName || adjustment === undefined) {
        return res.status(400).json({ error: '모든 필드가 필요합니다' });
      }

      const user = await db
        .collection('coffee')
        .findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
      }

      const debtIndex = user.debt.findIndex(
        (d: { name: string }) => d.name === debtorName
      );

      if (debtIndex === -1) {
        return res.status(404).json({ error: '해당 debt를 찾을 수 없습니다' });
      }

      const newAmount = user.debt[debtIndex].amount + adjustment;

      let updateOperation;
      if (newAmount <= 0) {
        // debt 제거
        updateOperation = {
          $pull: { debt: { name: debtorName } },
        };
      } else {
        // debt 금액 업데이트
        updateOperation = {
          $set: { [`debt.${debtIndex}.amount`]: newAmount },
        };
      }

      const result = await db
        .collection('coffee')
        // @ts-ignore
        .updateOne({ _id: new ObjectId(userId) }, updateOperation);

      if (result.modifiedCount === 1) {
        res.status(200).json({ message: 'debt가 성공적으로 조정되었습니다' });
      } else {
        res.status(500).json({ error: 'debt 조정에 실패했습니다' });
      }
    } catch (error) {
      console.error('debt 조정 중 오류:', error);
      res
        .status(500)
        .json({ error: '데이터베이스에서 debt 조정 중 오류 발생' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
