'use client';

import { useEffect, useState } from 'react';
import { fetchTopicContent } from '@/app/lib/data'
import JournerMap from '@/app/components/ui/journey-map/journey-map';
import { JourneyLayer, JourneyContent } from '@/app/lib/types';
import KeywordCheckbox from "@/app/components/ui/notebook/elements/resources/keyword-checkbox";
// import Image from 'next/image';

export default function Page() {
    const [mapLevel, setMapLevel] = useState('');
    const [mapData, setMapData] = useState<JourneyLayer[]>();
    const [journeyContents, setJourneyContents] = useState<JourneyContent[]>();
    const [isReadOnly, setIsReadOnly] = useState(true);

    useEffect(() => {
        const loadTopic = async () => {
            try {
                const data = await fetchTopicContent("celula");

                const parseMapData = (data: {level: string, title: string, ui: {icon: string, color: string, description: string}, checklist: {keyword: string, content: string, img: string}[]}[]) => {
                    // Transform the fetched data into the structure needed for JourneyMap
                    const levelSet = [...new Set(data.map(item => item.level))];
                    const layerData = levelSet.map(level => ({
                        ring: parseInt(level),
                        items: data.filter(item => item.level === level).map(item => ({
                            name: item.title,
                            icon: item.ui.icon,
                            color: (["blue","red","green","yellow","purple","pink","indigo","gray","orange","teal"].includes(item.ui.color) ? item.ui.color : "gray") as "blue" | "red" | "green" | "yellow" | "purple" | "pink" | "indigo" | "gray" | "orange" | "teal",
                            level: item.title
                        }))
                    }));
                    const contents = data.map(item => ({
                        title: item.title,
                        contentList: item.checklist.map(cl => ({
                            keyword: cl.keyword, 
                            content: cl.content, 
                            img: cl.img,
                            isChecked: true
                        })),
                    }));
                    return {layerData, contents};
                };

                const {layerData, contents} = parseMapData(data.contents);

                setMapData(layerData);
                setJourneyContents(contents);
            }
            catch (error) {
                console.error("Failed to fetch topic content:", error);
            }
        }
        loadTopic();
    }, []);
    return (
        <main className="h-full ">
            <h1 className='text-center text-bold text-xl'>Contenido del MVP</h1>
            <div className='flex flex-row flex-grow space-x-4 p-4 w-full max-h-full'>
                <div className='w-1/2 bg-gray-300 rounded-lg'>
                    <JournerMap state='end' data={mapData} updateLevel={setMapLevel}></JournerMap>
                </div>
                <div className='w-1/2 bg-gray-300 rounded-lg flex flex-col items-center overflow-auto'>
                    <h2 className='text-xl font-bold p-4 w-full'>Nivel seleccionado: {mapLevel}</h2>
                    <button type='button' className='p-2 w-1/5 border rounded-lg hover:bg-blue-400 cursor-pointer' onClick={() => setIsReadOnly(!isReadOnly)}>Editar</button>
                    <h3 className='text-lg font-semibold p-4 w-full'>Contenido:</h3>
                    <div className='p-4 mt-[-20px] flex flex-col space-y-1 w-full'>
                        {journeyContents && isReadOnly && journeyContents.filter(jc => jc.title === mapLevel)[0]?.contentList.map((c, index) => (
                            <KeywordCheckbox
                                key={index}
                                name={c.keyword}
                                isChecked={true}
                                content={c.content}
                            />
                        ))}
                        {journeyContents && !isReadOnly && journeyContents.filter(jc => jc.title === mapLevel)[0]?.contentList.map((c, index) => (
                            <div key={index} className='p-2 border rounded bg-white text-gray-700 flex flex-col space-y-2'>
                                <label htmlFor={`name-${index}`} className='font-semibold'>Nombre: 
                                    <input id={`name-${index}`} defaultValue={c.keyword} className='ml-2 border border-gray-500 rounded-sm p-1'/>
                                </label>
                                <label htmlFor={`content-${index}`} className='font-semibold'>Contenido: 
                                    <textarea id={`content-${index}`} defaultValue={c.content} className='border border-gray-500 rounded-sm p-1 w-full h-24'/>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
