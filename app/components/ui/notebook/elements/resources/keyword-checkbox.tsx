'use client';
import { useState } from 'react';

interface KeywordCheckboxProps {
    key?: number;
    name: string;
    isChecked: boolean;
    content: string;
}

export default function KeywordCheckbox(props: KeywordCheckboxProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative flex items-center text-gray-800 hover:bg-cyan-50 p-2 rounded"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && props.isChecked && (
                <div className="absolute left-0 top-10 w-full bg-white p-2 border border-gray-300 rounded shadow-lg z-10" onMouseEnter={() => setIsHovered(false)}>
                    <p className="text-m text-gray-700">{props.content}</p>
                </div>
            )}
            <input
                type="checkbox"
                className="absolute h-0 w-0 opacity-0" // Hide the native checkbox
                id="my-checkbox"
                disabled
                checked={props.isChecked}
            />
            <label
                htmlFor="my-checkbox"
                className={`
                flex items-center justify-center 
                h-4 w-4 rounded 
                border-2 border-gray-400 mr-2
                ${props.isChecked ? 'bg-green-600 border-green-600' : ''}
                `}
            >
                {props.isChecked && (
                <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                )}
            </label>
            <span className={props.isChecked ? 'text-green-600' : 'text-gray-600'}>{props.name}</span>
        </div>
    );
}