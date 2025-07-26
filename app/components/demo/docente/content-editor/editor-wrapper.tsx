'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import JourneyMap from "@/app/components/ui/journey-map";
import ContentEditor from "@/app/components/demo/docente/content-editor/content-editor";
import { TopicResponse } from '@/app/lib/types'; // Ensure TopicResponse and TopicContent are defined here
import { fetchTopicContent } from '@/app/lib/data'; // Import the client-callable fetch function

export default function EditorWrapper() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title'); // Get the title from the URL query parameter

    const [level, setLevel] = useState(''); // State for the selected icon level
    const [content, setContent] = useState<TopicResponse | undefined>(undefined); // State for fetched content
    const [isLoading, setIsLoading] = useState(false); // State for loading status
    const [error, setError] = useState<string | null>(null); // State for error messages

    // useEffect to fetch content when the 'title' query parameter changes
    useEffect(() => {
        // Only fetch if a title is present
        if (title) {
            const loadContent = async () => {
                setIsLoading(true);
                setError(null); // Clear previous errors
                try {
                    // Call the async fetch function directly
                    const fetchedContent = await fetchTopicContent("celula"); // title
                    setContent(fetchedContent);
                } catch (err) {
                    console.error("Failed to fetch topic content:", err);
                    setError("Failed to load content. Please try again.");
                    setContent(undefined); // Clear content on error
                } finally {
                    setIsLoading(false);
                }
            };

            loadContent();
        } else {
            // If no title, clear content and set loading to false
            setContent(undefined);
            setIsLoading(false);
            setError(null);
        }
    }, [title]); // Dependency array: re-run this effect whenever 'title' changes

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Crear Nuevo Contenido {title ? `- ${title}` : ''}</h1>
            <div className='w-full flex flex-col md:flex-row gap-4 h-[90%]'>
                <div className="p-4 bg-white rounded-lg shadow-md w-1/2 min-w-[480px]">
                    {/* JourneyMap will update the 'level' state when an icon is clicked */}
                    <JourneyMap state="end" onSetLevel={setLevel} />
                </div>
                <div className='p-4 w-1/2 min-w-[480px] rounded-lg shadow-md'>
                    {isLoading && <div className="text-center text-gray-600">Cargando contenido...</div>}
                    {error && <div className="text-center text-red-500">{error}</div>}
                    {!isLoading && !error && (
                        // Pass the fetched content and the selected level to ContentEditor
                        <ContentEditor level={level} content={content} />
                    )}
                </div>
            </div>
        </>
    );
}