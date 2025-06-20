"use client";

import $ from 'jquery';

export default function Page() {
  const fields = [
    { id: "subject", label: "Curso", placeholder: "Curso" },
    { id: "name", label: "Tema", placeholder: "Escribe el nombre del tema" },
    { id: "instructions", label: "Objetivos", placeholder: "Escribe los objetivos" },
    { id: "content", label: "Contenido a tratar", placeholder: "Escribe el contenido" }
  ]

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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Crear tema de conversación</h1>
        {fields.map(field => (
          <label key={field.id} className="block text-white-700 mb-2" htmlFor={field.id}>
            {field.label}: 
            <input type="text" id={field.id} className="border border-gray-300 rounded-md p-2 w-full max-w-md"
            placeholder={field.placeholder}></input>
          </label>
        ))}
        <button type="button" onClick={handle_create_topic} className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto">
          Crear tema
        </button>
      </main>
    </div>
  );
}
