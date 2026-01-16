export default function Home({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Safisha Hub</h1>
          <p className="text-gray-600">Car Wash Management System</p>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-4">
          {/* Daily Sales Button */}
          <button
            onClick={() => onNavigate('records')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg p-8 transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-3xl mb-2">💰</div>
                <h2 className="text-2xl font-bold mb-1">Daily Sales</h2>
                <p className="text-blue-100 text-sm">Record daily transactions</p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </button>

          {/* Lead Records Button */}
          <button
            onClick={() => onNavigate('autodetailing')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-lg p-8 transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-3xl mb-2">✨</div>
                <h2 className="text-2xl font-bold mb-1">Lead Records</h2>
                <p className="text-teal-100 text-sm">Detailing services capture</p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </button>

          {/* Admin Button */}
          <button
            onClick={() => onNavigate('admin')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-lg p-8 transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-3xl mb-2">⚙️</div>
                <h2 className="text-2xl font-bold mb-1">Admin</h2>
                <p className="text-purple-100 text-sm">Manage daily operations</p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Select an option to continue</p>
        </div>
      </div>
    </div>
  );
}

