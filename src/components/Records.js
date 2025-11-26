import { useState, useEffect } from "react";
import { sendToGoogleSheets } from "../utils/googleSheets";

export default function Records({ onNavigate }) {
  const [entries, setEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    carModel: "",
    numberPlate: "",
    attendant1: "",
    attendant2: "",
    service: "Exterior Wash",
    payment: "Cash",
    amount: "",
    notes: "",
    priority: "Normal"
  });

  // Service pricing
  const servicePricing = {
    "Exterior Wash": 500,
    "Interior Clean": 800,
    "Full Detail": 1500,
    "Vacuum": 300,
    "Buffing": 1200,
    "Engine Wash": 600,
    "Steam Cleaning": 1000
  };

  useEffect(() => {
    const saved = localStorage.getItem("carwashEntries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("carwashEntries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    // Auto-fill amount based on service selection
    if (form.service && servicePricing[form.service]) {
      setForm(prev => ({ ...prev, amount: servicePricing[form.service].toString() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.service]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add entry to local state
      const newEntry = {
        ...form,
        time: new Date().toLocaleString(),
        id: Date.now().toString()
      };

      setEntries([newEntry, ...entries]);

      // Send to Google Sheets
      try {
        await sendToGoogleSheets(newEntry);
      } catch (error) {
        console.warn("Failed to send to Google Sheets, data saved locally:", error);
      }

      // Reset form
      setForm({
        name: "",
        location: "",
        phone: "",
        carModel: "",
        numberPlate: "",
        attendant1: "",
        attendant2: "",
        service: "Exterior Wash",
        payment: "Cash",
        amount: "",
        notes: "",
        priority: "Normal"
      });

      setCurrentStep(1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error("Error submitting entry:", error);
      alert("Error saving entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function nextStep() {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  }

  function prevStep() {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('home')}
                className="mr-4 text-gray-600 hover:text-gray-800 text-2xl"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">🚗 Safisha Hub</h1>
                <p className="text-sm text-gray-600">Car Wash Management</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Today's Entries</div>
              <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center">
            <span className="text-xl mr-2">✅</span>
            <span>Entry saved successfully!</span>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto p-4">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Vehicle Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">🚙 Vehicle Details</h2>
                <p className="text-sm text-gray-600">Enter vehicle information</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Registration Number *
                  </label>
                  <input
                    name="numberPlate"
                    value={form.numberPlate}
                    onChange={handleChange}
                    placeholder="e.g., KCA 123A"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Model
                  </label>
                  <input
                    name="carModel"
                    value={form.carModel}
                    onChange={handleChange}
                    placeholder="e.g., Toyota Camry, Honda Civic"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Priority
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Normal">🟢 Normal</option>
                    <option value="Urgent">🟡 Urgent</option>
                    <option value="VIP">🔴 VIP</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Next: Service Details →
              </button>
            </div>
          )}

          {/* Step 2: Service Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">🧽 Service Details</h2>
                <p className="text-sm text-gray-600">Select service and staff</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="Exterior Wash">🚿 Exterior Wash - KSh 500</option>
                    <option value="Interior Clean">🧹 Interior Clean - KSh 800</option>
                    <option value="Full Detail">✨ Full Detail - KSh 1,500</option>
                    <option value="Vacuum">🌪️ Vacuum - KSh 300</option>
                    <option value="Buffing">💎 Buffing - KSh 1,200</option>
                    <option value="Engine Wash">🔧 Engine Wash - KSh 600</option>
                    <option value="Steam Cleaning">💨 Steam Cleaning - KSh 1,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Man *
                  </label>
                  <select
                    name="attendant1"
                    value={form.attendant1}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Service Man</option>
                    <option value="John Kamau">👨‍🔧 John Kamau</option>
                    <option value="Peter Mwangi">👨‍🔧 Peter Mwangi</option>
                    <option value="Mary Wanjiku">👩‍🔧 Mary Wanjiku</option>
                    <option value="David Kiprotich">👨‍🔧 David Kiprotich</option>
                    <option value="Grace Akinyi">👩‍🔧 Grace Akinyi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assistant (Optional)
                  </label>
                  <select
                    name="attendant2"
                    value={form.attendant2}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">No Assistant</option>
                    <option value="John Kamau">👨‍🔧 John Kamau</option>
                    <option value="Peter Mwangi">👨‍🔧 Peter Mwangi</option>
                    <option value="Mary Wanjiku">👩‍🔧 Mary Wanjiku</option>
                    <option value="David Kiprotich">👨‍🔧 David Kiprotich</option>
                    <option value="Grace Akinyi">👩‍🔧 Grace Akinyi</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Next: Customer →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customer & Payment */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">👤 Customer & Payment</h2>
                <p className="text-sm text-gray-600">Complete the transaction</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g., 0712345678"
                    type="tel"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="House number or area"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      name="payment"
                      value={form.payment}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="Cash">💵 Cash</option>
                      <option value="M-Pesa">📱 M-Pesa</option>
                      <option value="Card">💳 Card</option>
                      <option value="Bank Transfer">🏦 Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (KSh) *
                    </label>
                    <input
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="0"
                      type="number"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions or notes..."
                    rows="3"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "💾 Save Entry"}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Recent Entries */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📋 Recent Entries
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {entries.length}
            </span>
          </h2>

          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🚗</div>
              <p>No entries yet. Add your first car wash entry!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {entries.slice(0, 5).map((entry, i) => (
                <div key={entry.id || i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">{entry.numberPlate}</div>
                      <div className="text-sm text-gray-600">{entry.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">KSh {entry.amount}</div>
                      <div className="text-xs text-gray-500">{entry.time}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{entry.service}</span>
                    <span>{entry.attendant1}</span>
                  </div>
                  {entry.priority !== "Normal" && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        entry.priority === "VIP" ? "bg-red-100 text-red-800" :
                        entry.priority === "Urgent" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {entry.priority}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {entries.length > 5 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... and {entries.length - 5} more entries
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-white border-t mt-8 p-4">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
            <div className="text-xs text-gray-600">Total Cars</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {entries.reduce((sum, entry) => sum + (parseInt(entry.amount) || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Revenue (KSh)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {entries.length > 0 ? Math.round(entries.reduce((sum, entry) => sum + (parseInt(entry.amount) || 0), 0) / entries.length) : 0}
            </div>
            <div className="text-xs text-gray-600">Avg. per Car (KSh)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

