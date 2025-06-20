"use client";
import { useRouter } from 'next/navigation';

export default function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: string;
  type: 'Pendiente' | 'En proceso' | 'Completado';
}) {
  const router = useRouter();
  return (
    <div 
        className="mt-2 rounded-xl bg-gray-50 text-black p-2 shadow-sm flex justify-evenly hover:bg-blue-600 hover:text-white transition-colors duration-300 cursor-pointer"
        onClick={() => router.push(`/demo/assignment?topic=${encodeURIComponent(value)}`)}
    >
        <h3 className="ml-2 w-1/3">{title}</h3>
        <p className="w-1/3">{value}</p>
        <p className="mr-2 w-1/3 text-right">{type}</p>
    </div>
  );
}
