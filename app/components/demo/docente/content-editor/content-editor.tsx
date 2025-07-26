// app/components/demo/docente/content-editor/content-editor.tsx
'use client'; // Keep this if it uses client-side hooks or event handlers

import Form from './form';
import {TopicResponse} from '@/app/lib/types'; // Ensure TopicResponse is imported

export default function ContentEditor({level, content}: {level: string, content?: TopicResponse}) {
    const isLevelSelected = !!level;
    
    // console.log('ContentEditor content:', content); // For debugging

    return (
        <div className="p-6 bg-gray-50 w-full min-h-[300px] rounded-lg shadow-inner flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isLevelSelected ? `Editando: ${level}` : "Editor de Contenido"}
            </h2>

            {isLevelSelected ? (
                // Render the Form, passing the content
                <Form title={level} content={content} />
            ) : (
                <div className="text-center p-4">
                    <p className="text-gray-800 text-lg">
                        Seleccione un ícono en el mapa para editar su contenido.
                    </p>
                </div>
            )}
        </div>
    );
}
