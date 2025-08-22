"use client";
import { useState } from 'react';
import Image from 'next/image';

import KeywordCheckbox from "./keyword-checkbox";
interface ContentItem {
    group: string;
    name: string;
    isChecked: boolean;
    content: string;
}
interface ResourcesProps {
    contentList: ContentItem[];
    img?: {path: string, alt: string};
}

export default function Resources(props: ResourcesProps) {
    const [selectedGroup, setSelectedGroup] = useState<string>("");

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Recursos</h2>
            <div>
                <select className="mb-4 p-2 text-gray-500 border border-gray-800 rounded w-full" onChange={(e) => setSelectedGroup(e.target.value)} value={selectedGroup}>
                    <option value="" disabled>
                        Selecciona un contenido:
                    </option>
                    {[...new Set(props.contentList.map(item => item.group))].map((group, index) => (
                        <option key={index} value={group}>
                            {group}
                        </option>)
                    )}
                </select>
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">Lista de Contenidos: {selectedGroup}</h3>
                {props.contentList.map((item, index) => (
                    item.group === selectedGroup && (
                        <KeywordCheckbox
                            key={index}
                            name={item.name}
                            isChecked={item.isChecked}
                            content={item.content}
                        />
                    )
                ))}
            </div>
            {props.img && props.img.alt===selectedGroup && (
            <div className="mt-6 w-full flex justify-center">
                <Image
                    src={props.img.path}
                    alt={props.img.alt}
                    width={300}
                    height={300}
                />
            </div>)
            }
            
        </div>
    );
}
