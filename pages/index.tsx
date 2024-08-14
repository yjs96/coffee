import React, { useState } from 'react';
import type { GetServerSideProps } from 'next';
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

export default function Home({ coffee: initialCoffee }: CoffeeProps) {
  const [coffee, setCoffee] = useState<Coffee[]>(initialCoffee);
  const [newName, setNewName] = useState<string>('');

  const handleAddPerson = () => {
    if (newName.trim()) {
      const newPerson: Coffee = {
        _id: Date.now().toString(),
        name: newName.trim(),
        debt: []
      };
      setCoffee([...coffee, newPerson]);
      setNewName('');
    }
  };

  const handleAddDebt = (personId: string, debtorName: string) => {
    setCoffee(prevCoffee => 
      prevCoffee.map(person => 
        person._id === personId
          ? {
              ...person,
              debt: [...person.debt, { name: debtorName, amount: 1 }]
            }
          : person
      )
    );
  };

  const handleRemoveDebt = (personId: string, debtorName: string) => {
    setCoffee(prevCoffee => 
      prevCoffee.map(person => 
        person._id === personId
          ? {
              ...person,
              debt: person.debt.filter(debt => debt.name !== debtorName)
            }
          : person
      )
    );
  };

  const handleIncreaseDebt = (personId: string, debtorName: string) => {
    setCoffee(prevCoffee => 
      prevCoffee.map(person => 
        person._id === personId
          ? {
              ...person,
              debt: person.debt.map(debt => 
                debt.name === debtorName
                  ? { ...debt, amount: debt.amount + 1 }
                  : debt
              )
            }
          : person
      )
    );
  };

  return (
    <div className={`${pretendard.variable} w-full h-full p-12 transition-all duration-200`}>
      <div className={pretendard.className}>
        <div className="flex justify-center">
          <div className="w-full flex-col flex h-[calc(100vh-280px)] overflow-y-scroll">
            {coffee.map((obj) => (
              <div key={obj._id} className="w-full h-16 my-1 px-4 py-1 flex justify-between items-center">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center justify-center gap-2">
                    <Avatar>
                      <AvatarFallback>{obj.name.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-lg">{obj.name}</div>
                    <div className="flex justify-center items-center gap-5 ms-6">
                      <div className="flex items-center gap-4">
                        {obj.debt.map((debt, index) => (
                          <Popover key={index}>
                            <PopoverTrigger>
                              <div className="border flex gap-2 justify-center items-center px-4 py-2 rounded-lg hover:bg-slate-100">
                                <span>{debt.name}</span>
                                <span>{debt.amount}잔</span>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="mt-2 w-[200px] flex justify-between">
                              <Button variant="destructive" onClick={() => handleRemoveDebt(obj._id, debt.name)}>빼기</Button>
                              <Button variant="outline" onClick={() => handleIncreaseDebt(obj._id, debt.name)}>추가하기</Button>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Select onValueChange={(value) => handleAddDebt(obj._id, value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="추가할 사람 선택"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {coffee
                      .filter(person => person.name !== obj.name)
                      .map(person => (
                        <SelectItem key={person._id} value={person.name}>{person.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="w-1/3 gap-4 flex justify-center items-center fixed bottom-40">
            <Input 
              type="text" 
              placeholder="이름" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button onClick={handleAddPerson}>추가</Button>
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