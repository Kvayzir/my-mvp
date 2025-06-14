"use client";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { setUserId } = useUser();
  const router = useRouter();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">
          Viajes de Aprendizaje
        </h1>
        <label className="block text-white-700 mb-2" htmlFor="user_id">
          Alumno:
          <input
            type="text"
            id="user_id"
            className="border border-gray-300 rounded-md p-2 w-full max-w-md"
            placeholder="Escribe tu nombre"
          />
        </label>
        <button
          type="button"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          onClick={async () => {
            const userId = (document.getElementById("user_id") as HTMLInputElement).value;
            if (userId.trim() === "") {
              alert("Por favor, ingresa tu nombre.");
              return;
            }
            try {
              const response = await fetch("http://localhost:8000/user/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({user_id: userId, classroom:""}),
              });
              console.log(response);
              setUserId(userId); 
              router.push('/demo'); // Navigate to next page
            } catch (error) {
              console.error('Error:', error);
            }
            console.log("User ID:", userId);
          }}
        >Entrar</button>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>Proyecto en desarrollo</p>
      </footer>
    </div>
  );
}
