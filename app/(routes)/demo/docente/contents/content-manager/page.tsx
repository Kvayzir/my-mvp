import JourneyMap from "@/app/components/ui/journey-map";

export default function Page() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Crear Nuevo Contenido</h1>
            <div className="p-4 bg-white rounded-lg shadow-md">
                <JourneyMap state="complete" />
            </div>
        </>
    );
}