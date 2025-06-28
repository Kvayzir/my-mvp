"use client";

import $ from 'jquery';
import Pagination from '@/app/components/demo/docente/pagination';
import { useSearchParams } from 'next/navigation';

export default function CreationForm() {
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const itemsPerPage = 4;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const fields = [
        { id: "subject", label: "Curso", placeholder: "Curso" },
        { id: "name", label: "Tema", placeholder: "Escribe el nombre del tema" },
        { id: "instructions", label: "Objetivos", placeholder: "Escribe los objetivos" },
        { id: "content", label: "Contenido a tratar", placeholder: "Escribe el contenido" },
        { id: "AI-name", label: "Nombre de la IA", placeholder: "Jarvis" },
        { id: "AI-mood", label: "Personalidad de la IA", placeholder: "Amigable, divertido, misterioso" },
        { id: "AI-language", label: "Lenguaje", placeholder: "Científico, retórico, jovial" },
        { id: "AI-indications", label: "Instrucciones", placeholder: "Haz preguntas sobre ..." },
        { id: "AI-metric", label: "Estimación en base a chat", placeholder: "Estima el interés del alumno en el tema en una escala del 1 al 7" },
        { id: "Metrics", label: "TBD", placeholder: "Otras métricas: cantidad de mensajes por alumno, tiempo dedicado" },
    ]
    const paginatedFields = fields.slice(startIndex, endIndex);

    const handle_create_topic = () => {
        const topic: { [key: string]: unknown } = {};
        fields.forEach(field => topic[field.id] = $("#" + field.id).val());

        // Here you would typically send the data to your backend API
        console.log("Creating topic:", topic);
        $.ajax({
        url: 'http://localhost:8000/topics/create', // Replace with your backend endpoint
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(topic),
        success: function(response) {
            console.log("Topic created successfully:", response);
            alert("Tema creado exitosamente");
        },
        error: function(error) {
            console.error("Error creating topic:", error);
            alert("Error al crear el tema");
        }
        });
    }
    return (
        <main className="flex flex-col gap-[32px] items-center sm:items-start">
            <h1 className="text-2xl font-bold">Crear tema de conversación</h1>
            <div className="flex w-[400px] h-[400px] justify-center flex-col sm:items-start gap-4 mx-auto">
                {paginatedFields.map(field => (
                <label key={field.id} className="block text-white-700 mb-2" htmlFor={field.id}>
                    {field.label}: 
                    <input type="text" id={field.id} className="w-full border border-gray-300 rounded-md p-2"
                    placeholder={field.placeholder}></input>
                </label>
                ))}
            </div>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={3} />
            </div>
            <div className="mt-5 flex w-full justify-center">
                <button type="button" onClick={handle_create_topic} className="rounded-full border border-solid border-transparent transition-colors justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto">
                    Crear tema
                </button>
            </div>
        </main>
    );
}