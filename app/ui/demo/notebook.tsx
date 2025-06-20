export default function Notebook(){
    return (
        <div className="flex flex-col items-center justify-center rounded-md bg-gray-100 w-1/2 p-4">   
            <h1 className="text-3xl font-bold text-gray-500 mb-4">Notebook</h1>
            <textarea 
                className="text-lg text-gray-700 w-full border border-gray-300 rounded-s shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows={8}
                onPaste={(e) => {e.preventDefault()}} // Prevent paste to avoid formatting issues
            ></textarea>
            <div className="flex justify-end mt-4">
                <button 
                    className="bg-gray-500 text-white m-2 px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    onClick={() => alert("Reviewing notebook...")}
                >
                    Chequear
                </button>
                <button 
                    className="bg-blue-500 text-white m-2 px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    onClick={() => alert("Notebook saved!")}
                >
                    Entregar
                </button>
            </div>
        </div>
    );
}