'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import JourneyMap from "@/app/components/ui/journey-map";
import ContentEditor from "@/app/components/demo/docente/content-editor/content-editor";

export default function Page() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');
    const [level, setLevel] = useState('');
    useEffect(() => {
        if (!title) return;

    }, [title]);

    useEffect(() => {
        if (level) {
            console.log("Level set to:", level);
        }
    }, [level]);

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Crear Nuevo Contenido {title}</h1>
            <div className='w-full flex flex-col md:flex-row gap-4 h-[90%]'>
                <div className="p-4 bg-white rounded-lg shadow-md w-1/2 min-w-[480px]">
                    <JourneyMap state="end" onSetLevel={setLevel} />
                </div>
                <div className='p-4 w-1/2 min-w-[480px] rounded-lg shadow-md'>
                    <ContentEditor level={level} />
                </div>
            </div>
        </>
    );
}
