import { useState, useEffect } from "react";
import { sendToGoogleSheets } from "../utils/googleSheets";

export default function Autodetailing({ onNavigate }) {
  const [entries, setEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    vehicleModel: "",
    numberPlate: "",
    customerName: "",
    customerPhone: ""
  });

  // Vehicle models dropdown list
  const vehicleModels = [
    "Toyota Corolla",
    "Toyota Camry",
    "Toyota RAV4",
    "Toyota Land Cruiser",
    "Toyota Hilux",
    "Toyota Prado",
    "Honda Civic",
    "Honda Accord",
    "Honda CR-V",
    "Honda Fit",
    "Nissan X-Trail",
    "Nissan Patrol",
    "Nissan Note",
    "Mazda Demio",
    "Mazda Axela",
    "Mazda CX-5",
    "Subaru Impreza",
    "Subaru Forester",
    "Subaru Outback",
    "Mitsubishi Outlander",
    "Mitsubishi Pajero",
    "Mercedes-Benz C-Class",
    "Mercedes-Benz E-Class",
    "BMW 3 Series",
    "BMW 5 Series",
    "BMW X5",
    "Audi A4",
    "Audi Q5",
    "Volkswagen Golf",
    "Volkswagen Passat",
    "Range Rover Sport",
    "Range Rover Evoque",
    "Land Rover Discovery",
    "Peugeot 3008",
    "Peugeot 5008",
    "Other"
  ];

  useEffect(() => {
    const saved = localStorage.getItem("leadRecords");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("leadRecords", JSON.stringify(entries));
  }, [entries]);

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
        timestamp: new Date().toLocaleString(),
        date: new Date().toISOString().split('T')[0],
        id: Date.now().toString(),
        type: "lead"
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
        vehicleModel: "",
        numberPlate: "",
        customerName: "",
        customerPhone: ""
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error("Error submitting entry:", error);
      alert("Error saving entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function deleteLead(id) {
    setEntries(entries.filter(entry => entry.id !== id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
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
                <p className="text-sm text-gray-600">Capture Customer Leads</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Leads</div>
              <div className="text-2xl font-bold text-teal-600">{entries.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center justify-center">
            <span className="text-xl mr-2">✅</span>
            <span>Lead saved successfully!</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4">
        {/* Lead Entry Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-center">📝 New Lead Entry</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Vehicle Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Model *
                </label>
                <select
                  name="vehicleModel"
                  value={form.vehicleModel}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  required
                >
                  <option value="">Select Vehicle Model</option>
                  {vehicleModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Registration Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Reg No *
                </label>
                <input
                  type="text"
                  name="numberPlate"
                  value={form.numberPlate}
                  onChange={handleChange}
                  placeholder="e.g., KCA 123A"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none font-mono uppercase"
                  required
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="e.g., 0712345678"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-teal-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "💾 Save Lead"}
            </button>
          </form>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
            <span className="flex items-center">
              📋 All Leads
              <span className="ml-2 bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded-full">
                {entries.length}
              </span>
            </span>
          </h2>

          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-lg">No leads yet</p>
              <p className="text-sm">Add your first lead using the form above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-lg font-mono font-bold text-sm">
                          {entry.numberPlate}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {entry.vehicleModel}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">👤 </span>
                          <span className="font-medium text-gray-800">{entry.customerName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">📱 </span>
                          <span className="text-gray-700">{entry.customerPhone}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        📅 {entry.timestamp}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteLead(entry.id)}
                      className="text-red-500 hover:text-red-700 text-2xl ml-4"
                      title="Delete lead"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

