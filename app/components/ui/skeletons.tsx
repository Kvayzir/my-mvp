export function MessageSkeleton() {
    return (
        <div className="p-3 bg-gray-100 rounded-lg animate-pulse">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-12"></div>
            </div>
        </div>
    );
}
