"use client";

import {ContentPreviewProps} from '@/app/lib/types';
import { useState, useRef, useCallback  } from 'react';

export default function ContentPreview(props: ContentPreviewProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Callback for mouse movement to update cursor position relative to the container
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate cursor position relative to the top-left of the container
        setCursorPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        }
    }, []);
  
    // Parse the description string into a paragraph and a list
    const parseDescription = (description: string) => {
        const parts = description.split('\n\t');
        const mainParagraph = parts[0];
        const listItems = parts.slice(1); // Get all parts after the first one

        return (
        <>
            <p className="text-gray-700 mb-2">{mainParagraph}</p>
            {listItems.length > 0 && (
            <ul className="list-disc list-inside text-gray-600">
                {listItems.map((item, index) => (
                <li key={index}>{item}</li>
                ))}
            </ul>
            )}
        </>
        );
    };

    return (
        <div 
            ref={containerRef} // Attach the ref to the main div
            className="p-4 w-[240px] cursor-pointer border border-gray-300 rounded-md shadow hover:shadow-lg hover:bg-cyan-800 hover:text-black-100 transition-shadow duration-300 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
      >
            <h2 className="text-xl font-semibold mb-2">{props.title}</h2>
            {/* Hidden Description Popup */}
            <div 
                className={`absolute border border-gray-300 rounded-md p-4 transition-opacity duration-300 ${
                    isHovered ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                style={{ 
                    width: '180px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    top: `${cursorPosition.y + 15}px`,
                    left: `${cursorPosition.x + 15}px`,
                    pointerEvents: isHovered ? 'auto' : 'none',
                }}
                >
                {parseDescription(props.description)}
            </div>
        </div>
    );
}