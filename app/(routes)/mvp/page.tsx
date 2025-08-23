'use client';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
    return (
        <main className="flex flex-col h-full justify-center items-center space-y-8 overflow-hidden">
        <div className="p-4 w-full">
            <h1 className="text-8xl text-center font-bold mb-4">Viajes de Aprendizaje</h1>
            <p className="text-gray-700 text-center text-m">MVP: Prueba de concepto 1</p>
        </div>
        <div className="flex flex-row space-x-18 h-1/2 items-center p-4">
            <div 
            className="
            text-center text-gray-400 p-4 
            flex flex-col items-center justify-center
            cursor-pointer hover:bg-blue-400 hover:text-white transition-colors duration-200
            rounded-lg w-1/2 h-1/2 border
            "
            onClick={() => router.push('/mvp/docente')}
            >
                <h2 className='text-xl font-bold'>Docente</h2>
                <p className='text-m p-2 mt-2'>Accede al contenido del Viaje de Aprendizaje</p>
            </div>
            <div 
            className="
            text-center text-gray-400 p-4
            flex flex-col items-center justify-center
            cursor-pointer hover:bg-blue-400 hover:text-white transition-colors duration-200
            rounded-lg w-1/2 h-1/2 border
            "
            onClick={() => router.push('/mvp/docente')}
            >
                <h2 className='text-xl font-bold'>Estudiante</h2>
                <p className='text-m p-2 mt-2'>Explora el material</p>
            </div>
        </div>
        </main>
    );
}
