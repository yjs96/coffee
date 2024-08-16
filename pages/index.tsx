import React, { useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import localFont from 'next/font/local';
import clientPromise from '@/lib/mongodb';
import type { Metadata } from 'next';
import Image from 'next/image';

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
import { toast, Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: '커피 내기',
};

const pretendard = localFont({
  src: '../static/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

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
  initialCoffee: Coffee[];
}

export default function Home({ initialCoffee }: CoffeeProps) {
  const [newUserName, setNewUserName] = useState('');
  const [coffeeList, setCoffeeList] = useState(initialCoffee);

  const fetchCoffeeList = async () => {
    try {
      const response = await fetch('/api/getCoffeeList');
      if (response.ok) {
        const data = await response.json();
        setCoffeeList(data);
      } else {
        console.error('커피 리스트 불러오기 실패');
      }
    } catch (error) {
      console.error('커피 리스트 불러오기 중 오류:', error);
    }
  };

  const sortedCoffeeList = useMemo(() => {
    return [...coffeeList].sort((a, b) => {
      const totalA = a.debt.reduce((sum, debt) => sum + debt.amount, 0);
      const totalB = b.debt.reduce((sum, debt) => sum + debt.amount, 0);
      return totalB - totalA; // 내림차순 정렬
    });
  }, [coffeeList]);

  const handleAddUser = async () => {
    if (newUserName.trim() === '') return;

    if (coffeeList.some((user) => user.name === newUserName.trim())) {
      alert('이미 등록되어있습니다!');
      return;
    }

    try {
      const response = await fetch('/api/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newUserName }),
      });

      if (response.ok) {
        setNewUserName('');
        await fetchCoffeeList(); // 새 사용자 추가 후 데이터 리로드
      } else {
        console.error('사용자 추가 실패');
      }
    } catch (error) {
      console.error('사용자 추가 중 오류:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddUser();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch('/api/deleteUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await fetchCoffeeList(); // 사용자 삭제 후 데이터 리로드
      } else {
        console.error('사용자 삭제 실패');
      }
    } catch (error) {
      console.error('사용자 삭제 중 오류:', error);
    }
  };

  const handleAddDebt = async (userId: string, debtorName: string) => {
    try {
      const response = await fetch('/api/addDebt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, debtorName, amount: 1 }),
      });

      if (response.ok) {
        await fetchCoffeeList(); // 데이터 리로드
      } else {
        console.error('debt 추가 실패');
      }
    } catch (error) {
      console.error('debt 추가 중 오류:', error);
    }
  };

  const handleAdjustDebt = async (userId: string, debtorName: string, adjustment: number) => {
    try {
      const response = await fetch('/api/adjustDebt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, debtorName, adjustment }),
      });

      if (response.ok) {
        await fetchCoffeeList(); // 데이터 리로드
      } else {
        console.error('debt 조정 실패');
      }
    } catch (error) {
      console.error('debt 조정 중 오류:', error);
    }
  };

  const generateCopyText = () => {
    const usersWithDebt = coffeeList.filter((user) => user.debt.length > 0);

    const sortedUsers = usersWithDebt.sort((a, b) => {
      const totalDebtA = a.debt.reduce((sum, debt) => sum + debt.amount, 0);
      const totalDebtB = b.debt.reduce((sum, debt) => sum + debt.amount, 0);
      return totalDebtB - totalDebtA;
    });

    const text = sortedUsers
      .map((user) => {
        const debtText = user.debt
          .map((debt) => `${debt.name.substring(1, 3)} ${debt.amount}`)
          .join(' ');
        return `${user.name.substring(1, 3)} - ${debtText}`;
      })
      .join('\n');

    return text;
  };

  const handleCopyDebt = () => {
    const textToCopy = generateCopyText();
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success('복사되었습니다');
      })
      .catch((err) => {
        console.error('클립보드 복사 중 오류 발생:', err);
        alert('debt 정보 복사에 실패했습니다.');
      });
  };

  return (
    <>
      <Toaster />
      <div
        className={`${pretendard.variable} ${pretendard.className} w-full flex flex-col items-center justify-center`}
      >
        {/* 리스트 */}
        <div className="flex flex-col w-full md:w-2/3 md:mt-12 h-[84dvh] md:h-[calc(100dvh-280px)] overflow-y-scroll">
          {/* 리스트 한개 */}
          {sortedCoffeeList.map((obj) => (
            <div
              key={obj._id}
              className="flex flex-col md:flex-start md:flex-row justify-between items-start col:items-center pt-4 md:pt-0 mb-12 md:mb-6 px-4 w-full group"
            >
              <div className="flex flex-wrap items-center gap-2">
                {/* 프사 */}
                <Avatar>
                  <AvatarFallback>{obj.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="font-medium text-lg">{obj.name}</div>
                <div className="w-[60px] text-sm text-gray-600">
                  총 {obj.debt.reduce((sum, debt) => sum + debt.amount, 0)}잔
                </div>
                {/* 갚을 커피 */}
                <div className="flex md:w-auto flex-wrap items-center gap-5 ms-6">
                  {obj.debt.map((deb, index) => (
                    <Popover key={index}>
                      <PopoverTrigger>
                        <div className="border flex gap-1.5 justify-center items-center px-4 py-2 rounded-lg hover:bg-slate-100">
                          <span>{deb.name}</span>
                          <span>{deb.amount}잔</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="mt-2 w-[200px] flex justify-between">
                        <Button
                          variant="destructive"
                          onClick={() => handleAdjustDebt(obj._id, deb.name, -1)}
                        >
                          빼기
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAdjustDebt(obj._id, deb.name, 1)}
                        >
                          추가하기
                        </Button>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </div>
              {/* 선택, 삭제 */}
              <div className="flex items-center justify-center">
                <Image
                  className="hidden md:block opacity-0 group-hover:opacity-100 mx-2 cursor-pointer"
                  src="/Close_round.svg"
                  width="20"
                  height="20"
                  alt="delete"
                  onClick={() => handleDeleteUser(obj._id)}
                />
                <Select onValueChange={(value) => handleAddDebt(obj._id, value)}>
                  <SelectTrigger className="mt-2 ms-6 md:mt-0 md:ms-0 w-[156px]">
                    <SelectValue placeholder="추가할 사람 선택"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sortedCoffeeList
                      .filter(
                        (person) =>
                          person.name !== obj.name &&
                          !obj.debt.some((debt) => debt.name === person.name)
                      )
                      .map((person) => (
                        <SelectItem key={person._id} value={person.name}>
                          {person.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  className="md:hidden block mt-2 ms-3"
                  onClick={() => handleDeleteUser(obj._id)}
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
        {/* 이름 추가 */}
        <div className="w-full mt-5 mb-1 px-10 md:p-0 md:w-1/4 gap-4 flex justify-center items-center">
          <Input
            type="text"
            placeholder="이름"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleAddUser}>추가</Button>
          <Button onClick={handleCopyDebt}>복사하기</Button>
        </div>
        <div>복사하기 기능 추가!</div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const client = await clientPromise;
    const db = client.db('coffee');
    const coffee = await db.collection('coffee').find().toArray();
    return {
      props: { initialCoffee: JSON.parse(JSON.stringify(coffee)) },
    };
  } catch (e) {
    console.error(e);
    return { props: { initialCoffee: [] } };
  }
};
