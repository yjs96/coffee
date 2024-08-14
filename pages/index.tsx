import client from '@/lib/mongodb';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import localFont from 'next/font/local';
import clientPromise from '@/lib/mongodb';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const pretendard = localFont({
  src: '../static/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

type ConnectionStatus = {
  isConnected: boolean;
};

interface Debt {
  name: string;
  amount: number;
}

interface Coffee {
  _id: string;
  name: string;
  debt: Debt[];
}

interface CoffeeProps {
  coffee: Coffee[];
}

// export const getServerSideProps: GetServerSideProps<ConnectionStatus> = async () => {
//   try {
//     await client.connect(); // `await client.connect()` will use the default database passed in the MONGODB_URI
//     return {
//       props: { isConnected: true },
//     };
//   } catch (e) {
//     console.error(e);
//     return {
//       props: { isConnected: false },
//     };
//   }
// };

export default function Home({ coffee }: CoffeeProps) {
  return (
    <div className={`${pretendard.variable} w-full h-full p-12 transition-all duration-200`}>
      <div className={pretendard.className}>
        <div className="flex justify-center">
          <div className="w-full flex-col flex h-[calc(100vh-280px)] overflow-y-scroll">
            {coffee.map((obj) => (
              <div className="w-full h-16 my-1 px-4 py-1 flex justify-between items-center">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center justify-center gap-2">
                    <Avatar>
                      <AvatarFallback>{obj.name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-lg">{obj.name}</div>
                    <div className="flex justify-center items-center gap-5 ms-6">
                      <div className="flex items-center gap-4">
                        {obj.debt.map((obj) => (
                          <Popover>
                            <PopoverTrigger>
                              <div className="border flex gap-2 justify-center items-center px-4 py-2 rounded-lg hover:bg-slate-100">
                                <span>{obj.name}</span>
                                <span>{obj.amount}잔</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="mt-2 w-[200px] flex justify-between">
                              <Button variant="destructive">빼기</Button>
                              <Button variant="outline">추가하기</Button>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="추가할 사람 선택"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="최규찬">최규찬</SelectItem>
                    <SelectItem value="문준일">문준일</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="w-1/3 gap-4 flex justify-center items-center fixed bottom-40">
            <Input type="text" placeholder="이름" />
            <Button>추가</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const client = await clientPromise;
    const db = client.db('coffee');
    const coffee = await db.collection('coffee').find().toArray();
    return {
      props: { coffee: JSON.parse(JSON.stringify(coffee)) },
    };
  } catch (e) {
    console.error(e);
    return { props: { coffee: [] } };
  }
};
