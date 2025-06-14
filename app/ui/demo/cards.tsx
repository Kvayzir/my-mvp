"use client";
import { useRouter } from 'next/navigation';

export default function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const router = useRouter();
  return (
    <div 
        className="mt-2 rounded-xl bg-gray-50 text-black p-2 shadow-sm flex justify-evenly hover:bg-blue-600 hover:text-white transition-colors duration-300 cursor-pointer"
        onClick={() => router.push(`/demo/assignment?topic=${encodeURIComponent(value)}`)}
    >
        <h3 className="ml-2">{title}</h3>
        <p>{value}</p>
        <p>{type}</p>
    </div>
  );
}
