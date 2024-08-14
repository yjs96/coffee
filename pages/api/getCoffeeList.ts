import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('coffee');

      // 총 debt amount를 계산하고 정렬하는 MongoDB Aggregation Pipeline
      const coffeeList = await db
        .collection('coffee')
        .aggregate([
          {
            $addFields: {
              totalDebt: {
                $sum: '$debt.amount',
              },
            },
          },
          {
            $sort: { totalDebt: -1 }, // -1은 내림차순 정렬
          },
        ])
        .toArray();

      res.status(200).json(coffeeList);
    } catch (error) {
      console.error('커피 리스트 가져오기 중 오류:', error);
      res
        .status(500)
        .json({
          error: '데이터베이스에서 커피 리스트를 가져오는 중 오류 발생',
        });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
