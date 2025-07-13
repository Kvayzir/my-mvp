import React from 'react';
import Image from 'next/image';

export function NotesContent({ onCheck, onSubmit }: {onCheck: () => void, onSubmit: () => void}){
    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">My Notes</h2>
            <textarea 
            className="flex-1 text-lg text-gray-700 w-full border-none bg-transparent resize-none focus:outline-none leading-relaxed p-4"
            placeholder="Write your notes here..."
            rows={12}
            style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
                backgroundSize: '100% 32px',
                lineHeight: '32px',
                paddingTop: '8px'
            }}
            onPaste={(e) => {e.preventDefault()}} // Prevent paste to avoid formatting issues
            />
            <div className="flex justify-end mt-6 space-x-3">
            <button 
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors shadow-md"
                onClick={onCheck}
            >
                Chequear
            </button>
            <button 
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-md"
                onClick={onSubmit}
            >
                Entregar
            </button>
            </div>
        </div>
        );
}

export function TasksContent(){
    return (
        <div className="p-6">
            <h2 className="text-4xl font-bold text-gray-700 mb-6 text-center">Intrucciones</h2>
            <p className="text-3l text-gray-500 mb-8 pt-[20px]">Completar 3 temas del Viaje de Aprendizaje y escribir un reporte libre sobre los temas aprendidos</p>
            <div className="space-y-3">
                <div className="flex items-center space-x-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Completar introducción</span>
                </div>
                <div className="flex items-center space-x-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Completar Tema 1</span>
                </div>
                <div className="flex items-center space-x-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Completar Tema 2</span>
                </div>
                <div className="flex items-center space-x-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Completar Tema 3</span>
                </div>
                <div className="flex items-center space-x-3">
                    <input type="checkbox" className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Enviar reporte</span>
                </div>
            </div>
        </div>
    );
}

export function Resources(){
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Recursos</h2>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Citoesqueleto</h3>
                <Image
                    src="/images/content/Citoesqueleto.png"
                    alt="Citoesqueleto"
                    width={300}
                    height={300}
                />
            </div>
        </div>
    );
}

export function IdeasContent(){
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Ideas</h2>
            <div className="space-y-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-r">
                <p className="text-gray-700">Implement dark mode for better user experience</p>
            </div>
            <div className="bg-green-100 border-l-4 border-green-400 p-4 rounded-r">
                <p className="text-gray-700">Add voice notes functionality</p>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-400 p-4 rounded-r">
                <p className="text-gray-700">Create collaborative editing features</p>
            </div>
            </div>
        </div>
    );
}