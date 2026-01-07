export function ServiceUnavailableFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="max-w-md w-full p-8 text-center bg-white rounded-3xl shadow-2xl border border-red-50">
                <div className="text-5xl mb-6">🍕</div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">
                    Service Unavailable
                </h1>
                <p className="text-gray-500 mb-8">
                    We&apos;re having trouble connecting to our servers.
                </p>
                <button
                    onClick={() =>
                        typeof window !== 'undefined' &&
                        window.location.reload()
                    }
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
}
