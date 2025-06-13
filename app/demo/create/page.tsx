"use client";

import $ from 'jquery';

export default function Create() {
  const handle_create_topic = () => {
    const topicName = $("#topicName").val();
    const topicInstructions = $("#topicInstructions").val();
    const topicContent = $("#topicContent").val();

    // Here you would typically send the data to your backend API
    console.log("Creating topic:", { topicName, topicInstructions, topicContent });
    
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Crear tema de conversación</h1>
        <label className="block text-white-700 mb-2" htmlFor="topicName">
          Tema: 
          <input type="text" id="topicName" className="border border-gray-300 rounded-md p-2 w-full max-w-md"
          placeholder="Escribe el nombre del tema"></input>
        </label>
        <label className="block text-white-700 mb-2" htmlFor="topicInstructions">
          Objetivos:
          <input type="text" id="topicInstructions" className="border border-gray-300 rounded-md p-2 w-full max-w-md"
          placeholder="Escribe los objetivos"></input>
        </label>
        <label className="block text-white-700 mb-2" htmlFor="topicContent">
          Contenido a tratar:
          <input type="text" id="topicContent" className="border border-gray-300 rounded-md p-2 w-full max-w-md"
          placeholder="Escribe el contenido"></input>
        </label>

        <button type="button" onClick={handle_create_topic} className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto">
          Crear tema
        </button>
      </main>
    </div>
  );
}
