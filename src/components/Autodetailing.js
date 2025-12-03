import { useState, useEffect } from "react";
import { sendToGoogleSheets } from "../utils/googleSheets";

export default function Autodetailing({ onNavigate }) {
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
    selectedServices: [],
    payment: "Cash",
    amount: "",
    notes: "",
    priority: "Normal"
  });

  // Available detailing services (no pricing)
  const availableServices = [
    "Paint Correction",
    "Ceramic Coating",
    "Full Detailing",
    "Interior Detailing",
    "Headlight Restoration",
    "Scratch Removal",
    "Leather Treatment",
    "Engine Bay Detailing",
    "Upholstery Cleaning",
    "Odor Removal",
    "Window Tinting",
    "Number Plate Replacement",
    "Insurance Services",
    "Oil Change",
    "Add Ons"
  ];

  useEffect(() => {
    const saved = localStorage.getItem("autodetailingEntries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("autodetailingEntries", JSON.stringify(entries));
  }, [entries]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleServiceSelect(e) {
    const service = e.target.value;
    if (service && !form.selectedServices.includes(service)) {
      setForm({
        ...form,
        selectedServices: [...form.selectedServices, service]
      });
      // Reset the dropdown
      e.target.value = "";
    }
  }

  function removeService(service) {
    setForm({
      ...form,
      selectedServices: form.selectedServices.filter(s => s !== service)
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add entry to local state
      const newEntry = {
        ...form,
        time: new Date().toLocaleString(),
        id: Date.now().toString(),
        type: "autodetailing"
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
        selectedServices: [],
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
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
                <h1 className="text-2xl font-bold text-gray-800">✨ Lead Records</h1>
                <p className="text-sm text-gray-600">Detailing Lead Capture</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Today's Entries</div>
              <div className="text-2xl font-bold text-teal-600">{entries.length}</div>
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
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Vehicle Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
              <div className="text-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">🚙 Vehicle Details</h2>
                <p className="text-xs text-gray-600">Enter vehicle information</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vehicle Registration Number *
                  </label>
                  <input
                    name="numberPlate"
                    value={form.numberPlate}
                    onChange={handleChange}
                    placeholder="e.g., KCA 123A"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Vehicle Model
                  </label>
                  <input
                    name="carModel"
                    value={form.carModel}
                    onChange={handleChange}
                    placeholder="e.g., Toyota Camry, Honda Civic"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Service Priority
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
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
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
              >
                Next: Service Details →
              </button>
            </div>
          )}

          {/* Step 2: Service Selection */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
              <div className="text-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">✨ Service Needs</h2>
                <p className="text-xs text-gray-600">Select all services the customer needs</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Service to Add
                  </label>
                  <select
                    onChange={handleServiceSelect}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a service...</option>
                    {availableServices
                      .filter(service => !form.selectedServices.includes(service))
                      .map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selected Services */}
                {form.selectedServices.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Selected Services ({form.selectedServices.length})
                    </label>
                    <div className="space-y-2">
                      {form.selectedServices.map((service) => (
                        <div
                          key={service}
                          className="flex items-center justify-between p-2 bg-teal-50 border-2 border-teal-200 rounded-xl"
                        >
                          <span className="text-sm font-medium text-teal-900">{service}</span>
                          <button
                            type="button"
                            onClick={() => removeService(service)}
                            className="text-red-600 hover:text-red-800 font-bold text-xl"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={form.selectedServices.length === 0}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Customer →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Customer Information */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
              <div className="text-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">👤 Customer Information</h2>
                <p className="text-xs text-gray-600">Capture lead contact details</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g., 0712345678"
                    type="tel"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="House number or area"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any additional information about the lead..."
                    rows="2"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Summary of Selected Services */}
                <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">Service Needs:</div>
                  <div className="flex flex-wrap gap-1">
                    {form.selectedServices.map((service) => (
                      <span
                        key={service}
                        className="bg-teal-600 text-white px-2 py-1 rounded-full text-xs"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "💾 Save Lead"}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Recent Entries */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📋 Recent Leads
            <span className="ml-2 bg-teal-100 text-teal-800 text-sm px-2 py-1 rounded-full">
              {entries.length}
            </span>
          </h2>

          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✨</div>
              <p>No leads yet. Add your first detailing lead!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {entries.slice(0, 5).map((entry, i) => (
                <div key={entry.id || i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">{entry.numberPlate}</div>
                      <div className="text-sm text-gray-600">{entry.name}</div>
                      <div className="text-xs text-gray-500">{entry.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{entry.time}</div>
                      {entry.priority !== "Normal" && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          entry.priority === "VIP" ? "bg-red-100 text-red-800" :
                          entry.priority === "Urgent" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {entry.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Service Needs:</div>
                    <div className="flex flex-wrap gap-1">
                      {entry.selectedServices && entry.selectedServices.map((service, idx) => (
                        <span
                          key={idx}
                          className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {entries.length > 5 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... and {entries.length - 5} more leads
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
            <div className="text-2xl font-bold text-teal-600">{entries.length}</div>
            <div className="text-xs text-gray-600">Total Leads</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {entries.filter(e => e.priority === "VIP").length}
            </div>
            <div className="text-xs text-gray-600">VIP Leads</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {entries.filter(e => e.priority === "Urgent").length}
            </div>
            <div className="text-xs text-gray-600">Urgent Leads</div>
          </div>
        </div>
      </div>
    </div>
  );
}

