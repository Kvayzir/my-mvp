"use client"; 

import { useEffect, useState } from 'react'; // Assuming Form might use useState internally
// Assuming ContentPreviewProps is not directly used here, but keeping for context if needed
// import { ContentPreviewProps } from '@/app/lib/types'; 

// Define the Form component (assuming it's in the same file or imported)
function Form({title}:{title: string}) {
    const [inputTitle, setInputTitle] = useState(title);
    
    useEffect(() => {
        setInputTitle(title);
    }, [title]);

    return (
        <div className="p-4 w-full bg-white rounded-md shadow-md">
            <form className="space-y-4 w-full">
                <div>
                    <label htmlFor="form-title" className="block text-sm font-medium text-gray-700">Título</label>
                    <input 
                        type="text" 
                        id="form-title" // Add id for accessibility
                        className="mt-1 block w-full text-gray-800 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-cyan-500 focus:border-cyan-500 p-2" 
                        value={inputTitle}
                        onChange={(e) => setInputTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="form-description" className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea 
                        id="form-description" // Add id for accessibility
                        className="mt-1 block w-full h-24 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-cyan-500 focus:border-cyan-500 p-2"
                        placeholder="Escribe la descripción aquí..." // Add a placeholder
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="form-content" className="block text-sm font-medium text-gray-700">Contenido</label>
                    <textarea 
                        id="form-content" // Add id for accessibility
                        className="mt-1 block w-full h-36 border text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-cyan-500 focus:border-cyan-500 p-2"
                        placeholder="Escribe el contenido aquí..." // Add a placeholder
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

// Main ContentEditor component
export default function ContentEditor({level}: {level: string}) {
    const isLevelSelected = !!level; // Converts level to a boolean: true if non-empty, false if empty

    return (
        <div className="p-6 bg-gray-50 w-full min-h-[300px] rounded-lg shadow-inner flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isLevelSelected ? `Editando: ${level}` : "Editor de Contenido"}
            </h2>

            {isLevelSelected ? (
                <Form title={level} />
            ) : (
                // If no level is selected, render the placeholder message
                <div className="text-center p-4">
                    <p className="text-gray-800 text-lg">
                        Seleccione un ícono en el mapa para editar su contenido.
                    </p>
                </div>
            )}
        </div>
    );
}