"use client";

import { useRouter } from 'next/navigation';

export default function AddTopicButton() {
  const router = useRouter();
  
  const handleAdd = () => {
    router.push('/demo/docente/create');
  };

  return (
    <button
      onClick={handleAdd}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer transition-colors duration-200"
    >
      Crear nuevo tema
    </button>
  );
}
