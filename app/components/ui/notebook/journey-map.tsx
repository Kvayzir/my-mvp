import JourneyIcon from "./journey-icon";

export default function JourneyMap() {
    return (
        <div className="flex flex-col items-center justify-center rounded-md bg-gray-100 w-1/2 p-4">   
            <h1 className="text-3xl font-bold text-gray-500 mb-4">Journey Map</h1>
            <div className="flex justify-end mt-4">
                <JourneyIcon name="History Journey" type="history" color="blue" />
                <JourneyIcon name="Science Journey" type="science" color="yellow" />
                <JourneyIcon name="Mystery Journey" type="mystery" color="indigo" />
            </div>
        </div>
    ); 
}