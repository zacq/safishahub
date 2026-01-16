import { useState, useEffect } from "react";
import { salesService } from "../services/supabaseService";
import { employeesService } from "../services/supabaseService";

export default function Records({ onNavigate }) {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState(""); // 'Vehicle Wash', 'Motorbike Wash', 'Carpet/Rug Wash'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    paymentMethod: "Cash",
    category: "",
    employee: "",
    serviceType: "",
    vehicleModel: "",
    price: "",
    numberOfMotorbikes: "",
    size: "",
    vehicleServiceType: "",
    motorbikeServiceType: "",
    carpetServiceType: ""
  });

  // Service types for vehicles (no prices associated)
  const vehicleServiceTypes = [
    "Exterior Wash",
    "Interior Clean",
    "Full Detail",
    "Vacuum",
    "Buffing",
    "Waxing",
    "Polish"
  ];

  // Service types for motorbikes (no prices associated)
  const motorbikeServiceTypes = [
    "Basic Wash",
    "Deep Clean",
    "Polish",
    "Chain Lubrication",
    "Full Detail",
    "Engine Clean"
  ];

  // Service types for carpets/rugs (no prices associated)
  const carpetServiceTypes = [
    "Deep Clean",
    "Stain Removal",
    "Dry Cleaning",
    "Steam Cleaning",
    "Odor Removal",
    "Scotchgard Protection"
  ];

  // Carpet/Rug sizes
  const carpetSizes = [
    "3x5",
    "4x6",
    "5x7",
    "6x9",
    "8x10",
    "9x12",
    "10x14",
    "12x15",
    "Custom Size"
  ];

  // Load sales from Supabase
  useEffect(() => {
    console.log('🔍 Records: Loading sales from Supabase...');
    loadSales();
  }, []);

  // Load employees from Supabase
  useEffect(() => {
    console.log('🔍 Records: Loading employees from Supabase...');
    loadEmployees();
  }, []);

  // Load sales function
  const loadSales = async () => {
    try {
      console.log('📊 Records: Calling salesService.getAll()...');
      const data = await salesService.getAll();
      console.log('✅ Records: Sales loaded:', data);
      setSales(data);
    } catch (error) {
      console.error('❌ Records: Error loading sales:', error);
    }
  };

  // Load employees function
  const loadEmployees = async () => {
    try {
      console.log('👥 Records: Calling employeesService.getAll()...');
      const data = await employeesService.getAll();
      console.log('✅ Records: Employees loaded:', data);
      setEmployees(data);
    } catch (error) {
      console.error('❌ Records: Error loading employees:', error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle employee selection
  const handleEmployeeSelect = (employeeName) => {
    setSelectedEmployee(employeeName);
    setSelectedServiceType("");
    setForm({
      date: new Date().toISOString().split('T')[0],
      description: "",
      amount: "",
      paymentMethod: "Cash",
      category: "",
      employee: employeeName,
      serviceType: "",
      vehicleModel: "",
      price: "",
      numberOfMotorbikes: "",
      size: "",
      vehicleServiceType: "",
      motorbikeServiceType: "",
      carpetServiceType: ""
    });
  };

  // Handle service type selection
  const handleServiceTypeSelect = (serviceType) => {
    setSelectedServiceType(serviceType);
    let category = "";
    if (serviceType === "Vehicle Wash") category = "vehicle";
    else if (serviceType === "Motorbike Wash") category = "motorbike";
    else if (serviceType === "Carpet/Rug Wash") category = "carpet";

    setForm({
      ...form,
      serviceType: serviceType,
      category: category
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newSale = {
        date: form.date,
        description: form.description || `${form.serviceType} - ${form.employee}`,
        amount: parseFloat(form.price),
        payment_method: form.paymentMethod,
        category: form.category,
        employee: form.employee,
        service_type: form.serviceType,
        vehicle_model: form.vehicleModel || null,
        number_of_motorbikes: form.numberOfMotorbikes ? parseInt(form.numberOfMotorbikes) : null,
        size: form.size || null,
        vehicle_service_type: form.vehicleServiceType || null,
        motorbike_service_type: form.motorbikeServiceType || null,
        carpet_service_type: form.carpetServiceType || null
      };

      console.log('💾 Records: Saving sale to Supabase...', newSale);

      // Save to Supabase
      const savedSale = await salesService.create(newSale);
      console.log('✅ Records: Sale saved successfully!', savedSale);

      // Reload sales to get updated list
      await loadSales();

      // Reset form and go back to employee selection
      setForm({
        date: new Date().toISOString().split('T')[0],
        description: "",
        amount: "",
        paymentMethod: "Cash",
        category: "",
        employee: "",
        serviceType: "",
        vehicleModel: "",
        price: "",
        numberOfMotorbikes: "",
        size: "",
        vehicleServiceType: "",
        motorbikeServiceType: "",
        carpetServiceType: ""
      });
      setSelectedEmployee("");
      setSelectedServiceType("");
    } catch (error) {
      console.error('❌ Error saving sale:', error);
      console.error('Error details:', error.message, error);
      alert(`Error saving sale: ${error.message || 'Please try again.'}\n\nCheck console for details.`);
    } finally {
      setLoading(false);
    }
  };

  // Go back to employee selection
  const goBackToEmployeeSelection = () => {
    setSelectedEmployee("");
    setSelectedServiceType("");
    setForm({
      date: new Date().toISOString().split('T')[0],
      description: "",
      amount: "",
      paymentMethod: "Cash",
      category: "",
      employee: "",
      serviceType: "",
      vehicleModel: "",
      price: "",
      numberOfMotorbikes: "",
      size: "",
      vehicleServiceType: "",
      motorbikeServiceType: "",
      carpetServiceType: ""
    });
  };

  // Go back to service type selection
  const goBackToServiceTypeSelection = () => {
    setSelectedServiceType("");
    setForm({
      ...form,
      serviceType: "",
      category: "",
      vehicleModel: "",
      price: "",
      numberOfMotorbikes: "",
      size: "",
      vehicleServiceType: "",
      motorbikeServiceType: "",
      carpetServiceType: ""
    });
  };

  // Delete sale
  const deleteSale = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) {
      return;
    }

    try {
      await salesService.delete(id);
      await loadSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Error deleting sale. Please try again.');
    }
  };

  // Calculate total sales
  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                <h1 className="text-2xl font-bold text-gray-800">💰 Daily Sales</h1>
                <p className="text-sm text-gray-600">Record Daily Transactions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Sales</div>
              <div className="text-2xl font-bold text-green-600">KSh {totalSales.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Employee Selection, Service Type Selection, or Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {!selectedEmployee ? (
            // Step 1: Employee Selection
            <div>
              <h2 className="text-xl font-semibold mb-6 text-center">
                👨‍🔧 Select Employee
              </h2>

              {employees.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="text-gray-600 mb-4">No employees added yet</p>
                  <button
                    onClick={() => onNavigate('admin')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Go to Admin Panel to Add Employees
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleEmployeeSelect(emp.name)}
                      className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-6 transition-all transform hover:scale-105 active:scale-95 shadow-lg text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">👨‍🔧</div>
                        <div>
                          <h3 className="text-xl font-bold">{emp.name}</h3>
                          <p className="text-green-100 text-sm">📱 {emp.phone}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : !selectedServiceType ? (
            // Step 2: Service Type Selection
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  👨‍🔧 {selectedEmployee} - Select Service Type
                </h2>
                <button
                  onClick={goBackToEmployeeSelection}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                >
                  ← Change Employee
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Vehicle Wash Button */}
                <button
                  onClick={() => handleServiceTypeSelect('Vehicle Wash')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <div className="text-5xl mb-3">🚗</div>
                  <h3 className="text-2xl font-bold mb-1">Vehicle Wash</h3>
                  <p className="text-blue-100 text-sm">Cars, SUVs, Vans</p>
                </button>

                {/* Motorbike Wash Button */}
                <button
                  onClick={() => handleServiceTypeSelect('Motorbike Wash')}
                  className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl p-8 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <div className="text-5xl mb-3">🏍️</div>
                  <h3 className="text-2xl font-bold mb-1">Motorbike Wash</h3>
                  <p className="text-orange-100 text-sm">Motorcycles, Bikes</p>
                </button>

                {/* Carpet/Rug Wash Button */}
                <button
                  onClick={() => handleServiceTypeSelect('Carpet/Rug Wash')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  <div className="text-5xl mb-3">🧺</div>
                  <h3 className="text-2xl font-bold mb-1">Carpet/Rug Wash</h3>
                  <p className="text-purple-100 text-sm">Carpets, Rugs, Mats</p>
                </button>
              </div>
            </div>
          ) : (
            // Step 3: Sale Entry Form
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {form.category === 'vehicle' && '🚗 Vehicle Wash'}
                  {form.category === 'motorbike' && '🏍️ Motorbike Wash'}
                  {form.category === 'carpet' && '🧺 Carpet/Rug Wash'}
                  <span className="text-sm font-normal text-gray-600">- {selectedEmployee}</span>
                </h2>
                <button
                  onClick={goBackToServiceTypeSelection}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                >
                  ← Change Service Type
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Common Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method *
                      </label>
                      <select
                        name="paymentMethod"
                        value={form.paymentMethod}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="Cash">💵 Cash</option>
                        <option value="M-Pesa">📱 M-Pesa</option>
                        <option value="Card">💳 Card</option>
                        <option value="Bank Transfer">🏦 Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  {/* Vehicle-Specific Fields */}
                  {form.category === 'vehicle' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Service Type *
                        </label>
                        <select
                          name="vehicleServiceType"
                          value={form.vehicleServiceType}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        >
                          <option value="">Select Service Type</option>
                          {vehicleServiceTypes.map((service) => (
                            <option key={service} value={service}>
                              {service}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Model *
                        </label>
                        <input
                          type="text"
                          name="vehicleModel"
                          value={form.vehicleModel}
                          onChange={handleChange}
                          placeholder="e.g., Toyota Camry, Honda Civic"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (KSh) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Motorbike-Specific Fields */}
                  {form.category === 'motorbike' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motorbike Service Type *
                        </label>
                        <select
                          name="motorbikeServiceType"
                          value={form.motorbikeServiceType}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        >
                          <option value="">Select Service Type</option>
                          {motorbikeServiceTypes.map((service) => (
                            <option key={service} value={service}>
                              {service}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Motorbikes *
                        </label>
                        <input
                          type="number"
                          name="numberOfMotorbikes"
                          value={form.numberOfMotorbikes}
                          onChange={handleChange}
                          placeholder="0"
                          min="1"
                          step="1"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (KSh) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Carpet-Specific Fields */}
                  {form.category === 'carpet' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Carpet Service Type *
                        </label>
                        <select
                          name="carpetServiceType"
                          value={form.carpetServiceType}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        >
                          <option value="">Select Service Type</option>
                          {carpetServiceTypes.map((service) => (
                            <option key={service} value={service}>
                              {service}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size *
                        </label>
                        <select
                          name="size"
                          value={form.size}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        >
                          <option value="">Select Size</option>
                          {carpetSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (KSh) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Saving...' : '💰 Record Sale'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sales List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
            <span>📊 Sales History</span>
            <span className="text-sm text-gray-500">{sales.length} entries</span>
          </h2>

          {sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💰</div>
              <p>No sales recorded yet. Add your first sale above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Category Icon */}
                    <div className="text-3xl">
                      {sale.category === 'vehicle' && '🚗'}
                      {sale.category === 'motorbike' && '🏍️'}
                      {sale.category === 'carpet' && '🧺'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-800">
                          {sale.category === 'vehicle' ? sale.vehicleModel :
                           sale.category === 'motorbike' ? `${sale.numberOfMotorbikes} Motorbike${sale.numberOfMotorbikes > 1 ? 's' : ''}` :
                           sale.category === 'carpet' ? `${sale.size} Carpet/Rug` :
                           sale.description}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sale.category === 'vehicle' ? 'bg-blue-100 text-blue-800' :
                          sale.category === 'motorbike' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {sale.category === 'vehicle' ? 'Vehicle' :
                           sale.category === 'motorbike' ? 'Motorbike' :
                           'Carpet/Rug'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sale.paymentMethod === "Cash" ? "bg-green-100 text-green-800" :
                          sale.paymentMethod === "M-Pesa" ? "bg-blue-100 text-blue-800" :
                          sale.paymentMethod === "Card" ? "bg-purple-100 text-purple-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </div>

                      {/* Service details */}
                      <div className="text-sm text-gray-600 mb-1">
                        👨‍🔧 {sale.employee} • 🧽 {sale.serviceType}
                        {sale.category === 'vehicle' && sale.vehicleServiceType && ` • ${sale.vehicleServiceType}`}
                        {sale.category === 'motorbike' && sale.motorbikeServiceType && ` • ${sale.motorbikeServiceType}`}
                        {sale.category === 'carpet' && sale.carpetServiceType && ` • ${sale.carpetServiceType}`}
                      </div>

                      <div className="text-sm text-gray-600">
                        📅 {new Date(sale.date).toLocaleDateString()} • 🕒 {sale.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        KSh {parseFloat(sale.amount).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSale(sale.id)}
                      className="text-red-500 hover:text-red-700 text-2xl"
                      title="Delete sale"
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