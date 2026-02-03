import { useState, useEffect } from "react";
import { leadsService } from "../services/supabaseService";

export default function Autodetailing({ onNavigate }) {
  const [entries, setEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState("vehicle");
  const [editingLead, setEditingLead] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    vehicleModel: "",
    registrationNumber: "",
    motorbikeModel: "",
    carpetType: "",
    carpetSize: "",
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

  // Load leads from Supabase
  useEffect(() => {
    loadLeads();
  }, []);

  // Load leads function
  const loadLeads = async () => {
    try {
      setLoading(true);
      console.log('🔍 Autodetailing: Loading leads from Supabase...');
      const data = await leadsService.getAll();
      console.log('✅ Autodetailing: Leads loaded:', data);
      setEntries(data);
    } catch (error) {
      console.error('❌ Autodetailing: Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare lead data based on asset type
      const baseData = {
        asset_type: assetType,
        customer_name: form.customerName,
        customer_phone: form.customerPhone,
        date: new Date().toISOString().split('T')[0]
      };

      let leadData = { ...baseData };

      // Add asset-specific fields
      if (assetType === 'vehicle') {
        leadData.vehicle_model = form.vehicleModel;
        leadData.registration_number = form.registrationNumber;
      } else if (assetType === 'motorbike') {
        leadData.motorbike_model = form.motorbikeModel;
      } else if (assetType === 'carpet') {
        leadData.carpet_type = form.carpetType;
        leadData.carpet_size = form.carpetSize;
      }

      console.log('💾 Autodetailing: Saving lead to Supabase...', leadData);

      // Save to Supabase
      const savedLead = await leadsService.create(leadData);
      console.log('✅ Autodetailing: Lead saved successfully!', savedLead);

      // Reload leads to get updated list
      await loadLeads();

      // Reset form
      setForm({
        vehicleModel: "",
        registrationNumber: "",
        motorbikeModel: "",
        carpetType: "",
        carpetSize: "",
        customerName: "",
        customerPhone: ""
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error("❌ Autodetailing: Error submitting entry:", error);
      alert(`Error saving lead: ${error.message || 'Please try again.'}\n\nCheck console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Start editing lead
  const startEditLead = (lead) => {
    setEditingLead(lead.id);
    setEditForm({
      assetType: lead.asset_type || 'vehicle',
      vehicleModel: lead.vehicle_model || '',
      registrationNumber: lead.registration_number || lead.number_plate || '',
      motorbikeModel: lead.motorbike_model || '',
      carpetType: lead.carpet_type || '',
      carpetSize: lead.carpet_size || '',
      customerName: lead.customer_name || '',
      customerPhone: lead.customer_phone || ''
    });
  };

  // Cancel editing lead
  const cancelEditLead = () => {
    setEditingLead(null);
    setEditForm({});
  };

  // Save edited lead
  const saveEditedLead = async (leadId) => {
    try {
      console.log('Saving lead with ID:', leadId);
      console.log('Edit form data:', editForm);

      // Build update data based on asset type
      const updateData = {
        asset_type: editForm.assetType,
        customer_name: editForm.customerName,
        customer_phone: editForm.customerPhone
      };

      // Add asset-specific fields
      if (editForm.assetType === 'vehicle') {
        updateData.vehicle_model = editForm.vehicleModel;
        updateData.registration_number = editForm.registrationNumber;
        // Clear other asset fields
        updateData.motorbike_model = null;
        updateData.carpet_type = null;
        updateData.carpet_size = null;
      } else if (editForm.assetType === 'motorbike') {
        updateData.motorbike_model = editForm.motorbikeModel;
        // Clear other asset fields
        updateData.vehicle_model = null;
        updateData.registration_number = null;
        updateData.carpet_type = null;
        updateData.carpet_size = null;
      } else if (editForm.assetType === 'carpet') {
        updateData.carpet_type = editForm.carpetType;
        updateData.carpet_size = editForm.carpetSize;
        // Clear other asset fields
        updateData.vehicle_model = null;
        updateData.registration_number = null;
        updateData.motorbike_model = null;
      }

      console.log('Update data to send:', updateData);

      // Update in Supabase
      const updatedLead = await leadsService.update(leadId, updateData);

      console.log('Updated lead:', updatedLead);

      // Reload leads
      await loadLeads();

      setEditingLead(null);
      setEditForm({});
      alert('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      console.error('Error details:', error.message);
      alert(`Failed to update lead: ${error.message}`);
    }
  };

  async function deleteLead(id) {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      console.log('🗑️ Autodetailing: Deleting lead:', id);
      await leadsService.delete(id);
      console.log('✅ Autodetailing: Lead deleted successfully!');
      await loadLeads();
    } catch (error) {
      console.error('❌ Autodetailing: Error deleting lead:', error);
      alert('Error deleting lead. Please try again.');
    }
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
            {/* Asset Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Asset Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAssetType('vehicle')}
                  className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                    assetType === 'vehicle'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                  }`}
                >
                  🚗 Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => setAssetType('motorbike')}
                  className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                    assetType === 'motorbike'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                  }`}
                >
                  🏍️ Motorbike
                </button>
                <button
                  type="button"
                  onClick={() => setAssetType('carpet')}
                  className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                    assetType === 'carpet'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                  }`}
                >
                  🧺 Carpet
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Vehicle Fields */}
              {assetType === 'vehicle' && (
                <>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={form.registrationNumber}
                      onChange={handleChange}
                      placeholder="e.g., KCA 123A"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none font-mono uppercase"
                      required
                    />
                  </div>
                </>
              )}

              {/* Motorbike Fields */}
              {assetType === 'motorbike' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motorbike Model *
                  </label>
                  <input
                    type="text"
                    name="motorbikeModel"
                    value={form.motorbikeModel}
                    onChange={handleChange}
                    placeholder="e.g., Honda CB500X, Yamaha MT-07"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              {/* Carpet Fields */}
              {assetType === 'carpet' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carpet Type *
                    </label>
                    <select
                      name="carpetType"
                      value={form.carpetType}
                      onChange={handleChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Carpet Type</option>
                      <option value="Persian Rug">Persian Rug</option>
                      <option value="Shaggy Carpet">Shaggy Carpet</option>
                      <option value="Wall-to-Wall">Wall-to-Wall</option>
                      <option value="Area Rug">Area Rug</option>
                      <option value="Runner">Runner</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carpet Size *
                    </label>
                    <select
                      name="carpetSize"
                      value={form.carpetSize}
                      onChange={handleChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Size</option>
                      <option value="Small (up to 6x4 ft)">Small (up to 6x4 ft)</option>
                      <option value="Medium (6x4 to 9x6 ft)">Medium (6x4 to 9x6 ft)</option>
                      <option value="Large (9x6 to 12x9 ft)">Large (9x6 to 12x9 ft)</option>
                      <option value="Extra Large (12x9+ ft)">Extra Large (12x9+ ft)</option>
                    </select>
                  </div>
                </>
              )}

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

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-lg">Loading leads...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-lg">No leads yet</p>
              <p className="text-sm">Add your first lead using the form above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                  {editingLead === entry.id ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      {/* Asset Type Selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Asset Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, assetType: 'vehicle' })}
                            className={`p-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                              editForm.assetType === 'vehicle'
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-700 border-gray-200'
                            }`}
                          >
                            🚗 Vehicle
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, assetType: 'motorbike' })}
                            className={`p-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                              editForm.assetType === 'motorbike'
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-700 border-gray-200'
                            }`}
                          >
                            🏍️ Motorbike
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, assetType: 'carpet' })}
                            className={`p-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                              editForm.assetType === 'carpet'
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-700 border-gray-200'
                            }`}
                          >
                            🧺 Carpet
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {/* Vehicle Fields */}
                        {editForm.assetType === 'vehicle' && (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Model</label>
                              <select
                                value={editForm.vehicleModel}
                                onChange={(e) => setEditForm({ ...editForm, vehicleModel: e.target.value })}
                                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                              >
                                <option value="">Select Vehicle Model</option>
                                {vehicleModels.map((model) => (
                                  <option key={model} value={model}>{model}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Registration Number</label>
                              <input
                                type="text"
                                value={editForm.registrationNumber}
                                onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none font-mono uppercase text-sm"
                              />
                            </div>
                          </>
                        )}

                        {/* Motorbike Fields */}
                        {editForm.assetType === 'motorbike' && (
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Motorbike Model</label>
                            <input
                              type="text"
                              value={editForm.motorbikeModel}
                              onChange={(e) => setEditForm({ ...editForm, motorbikeModel: e.target.value })}
                              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                            />
                          </div>
                        )}

                        {/* Carpet Fields */}
                        {editForm.assetType === 'carpet' && (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Carpet Type</label>
                              <select
                                value={editForm.carpetType}
                                onChange={(e) => setEditForm({ ...editForm, carpetType: e.target.value })}
                                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                              >
                                <option value="">Select Carpet Type</option>
                                <option value="Persian Rug">Persian Rug</option>
                                <option value="Shaggy Carpet">Shaggy Carpet</option>
                                <option value="Wall-to-Wall">Wall-to-Wall</option>
                                <option value="Area Rug">Area Rug</option>
                                <option value="Runner">Runner</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Carpet Size</label>
                              <select
                                value={editForm.carpetSize}
                                onChange={(e) => setEditForm({ ...editForm, carpetSize: e.target.value })}
                                className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                              >
                                <option value="">Select Size</option>
                                <option value="Small (up to 6x4 ft)">Small (up to 6x4 ft)</option>
                                <option value="Medium (6x4 to 9x6 ft)">Medium (6x4 to 9x6 ft)</option>
                                <option value="Large (9x6 to 12x9 ft)">Large (9x6 to 12x9 ft)</option>
                                <option value="Extra Large (12x9+ ft)">Extra Large (12x9+ ft)</option>
                              </select>
                            </div>
                          </>
                        )}

                        {/* Customer Fields */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Customer Name</label>
                          <input
                            type="text"
                            value={editForm.customerName}
                            onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Customer Phone</label>
                          <input
                            type="tel"
                            value={editForm.customerPhone}
                            onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEditLead}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditedLead(entry.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                        >
                          💾 Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Asset Type Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                            entry.asset_type === 'vehicle' ? 'bg-blue-100 text-blue-800' :
                            entry.asset_type === 'motorbike' ? 'bg-orange-100 text-orange-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {entry.asset_type === 'vehicle' && '🚗 Vehicle'}
                            {entry.asset_type === 'motorbike' && '🏍️ Motorbike'}
                            {entry.asset_type === 'carpet' && '🧺 Carpet'}
                          </div>
                        </div>

                        {/* Asset-Specific Details */}
                        <div className="mb-3">
                          {entry.asset_type === 'vehicle' && (
                            <div className="flex items-center gap-3">
                              <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-lg font-mono font-bold text-sm">
                                {entry.registration_number || entry.number_plate}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {entry.vehicle_model}
                              </div>
                            </div>
                          )}
                          {entry.asset_type === 'motorbike' && (
                            <div className="text-gray-700 font-medium">
                              🏍️ {entry.motorbike_model}
                            </div>
                          )}
                          {entry.asset_type === 'carpet' && (
                            <div className="flex items-center gap-3">
                              <div className="text-gray-700 font-medium">
                                {entry.carpet_type}
                              </div>
                              <div className="text-gray-500 text-sm">
                                📏 {entry.carpet_size}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Customer Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">👤 </span>
                            <span className="font-medium text-gray-800">{entry.customer_name || entry.customerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">📱 </span>
                            <span className="text-gray-700">{entry.customer_phone || entry.customerPhone}</span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="text-xs text-gray-500 mt-2">
                          📅 {entry.created_at
                            ? new Date(entry.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : entry.timestamp || 'N/A'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditLead(entry)}
                          className="px-3 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteLead(entry.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

