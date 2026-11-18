export default function AIThinkingState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-(--muted)/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-(--indigo) animate-spin"></div>
            </div>
            <div className="text-center">
                <p className="text-lg font-semibold text-(--text)">AI is crafting your perfect day...</p>
                <p className="text-sm text-(--muted) mt-1">Finding the best spots that match your vibe</p>
            </div>
        </div>
    )
}
