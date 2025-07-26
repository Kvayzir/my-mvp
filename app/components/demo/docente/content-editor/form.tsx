"use client"; 
import { useEffect, useState } from 'react';
import {TopicResponse} from '@/app/lib/types'; // Ensure TopicResponse is imported

export default function Form({title, content}:{title: string, content?: TopicResponse}) {
    const [inputTitle, setInputTitle] = useState(title);
    // Initialize inputDescription and inputMainContent from content prop
    const [inputDescription, setInputDescription] = useState('');
    const [inputMainContent, setInputMainContent] = useState(''); // Assuming your TopicContent has a 'mainContent' field

    // Update state when the 'title' prop changes
    useEffect(() => {
        setInputTitle(title);
    }, [title]);

    // Update description and main content when the 'content' prop changes
    useEffect(() => {
        content?.contents.forEach(item => {
            if (item.title === inputTitle) {
                setInputDescription(item.description || '');
                return;
            }
        });
        
    }, [content, inputTitle]); // Re-run when content prop changes

    return (
        <div className="p-4 w-full bg-white rounded-md shadow-md">
            <form className="space-y-4 w-full">
                <div>
                    <label htmlFor="form-title" className="block text-sm font-medium text-gray-700">Título</label>
                    <input 
                        type="text" 
                        id="form-title"
                        className="mt-1 block w-full text-gray-800 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-cyan-500 focus:border-cyan-500 p-2" 
                        value={inputTitle}
                        onChange={(e) => setInputTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="form-description" className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea 
                        id="form-description"
                        className="mt-1 block w-full h-24 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-cyan-500 focus:border-cyan-500 p-2"
                        placeholder="Escribe la descripción aquí..."
                        value={inputDescription}
                        onChange={(e) => setInputDescription(e.target.value)}
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="form-content" className="block text-sm font-medium text-gray-700">Contenido</label>
                    <textarea 
                        id="form-content"
                        className="mt-1 block w-full h-36 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-cyan-500 focus:border-cyan-500 p-2"
                        placeholder="Escribe el contenido aquí..."
                        value={inputMainContent} // Use inputMainContent state
                        onChange={(e) => setInputMainContent(e.target.value)}
                    ></textarea>
                </div>
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors shadow-md"
                >
                    Editar
                </button>
            </form>
        </div>
    );
}