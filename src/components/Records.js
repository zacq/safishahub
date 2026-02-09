import { useState, useEffect } from "react";
import { salesService } from "../services/supabaseService";
import { employeesService } from "../services/supabaseService";

export default function Records({ onNavigate }) {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState(""); // 'Vehicle Wash', 'Motorbike Wash', 'Carpet/Rug Wash'
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("day"); // 'day', 'week', 'month', 'year'
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
    vehicleServiceType: [],
    motorbikeServiceType: [],
    carpetServiceType: []
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

  // Handle service type checkbox changes (for multi-select)
  const handleServiceTypeCheckbox = (fieldName, service) => {
    const currentServices = form[fieldName];
    let updatedServices;

    if (currentServices.includes(service)) {
      // Remove service if already selected
      updatedServices = currentServices.filter(s => s !== service);
    } else {
      // Add service if not selected
      updatedServices = [...currentServices, service];
    }

    setForm({ ...form, [fieldName]: updatedServices });
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
      vehicleServiceType: [],
      motorbikeServiceType: [],
      carpetServiceType: []
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
        vehicle_service_type: form.vehicleServiceType.length > 0 ? form.vehicleServiceType.join(', ') : null,
        motorbike_service_type: form.motorbikeServiceType.length > 0 ? form.motorbikeServiceType.join(', ') : null,
        carpet_service_type: form.carpetServiceType.length > 0 ? form.carpetServiceType.join(', ') : null
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
        vehicleServiceType: [],
        motorbikeServiceType: [],
        carpetServiceType: []
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
      vehicleServiceType: [],
      motorbikeServiceType: [],
      carpetServiceType: []
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
      vehicleServiceType: [],
      motorbikeServiceType: [],
      carpetServiceType: []
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

  // Helper function to filter sales by time period
  const filterSalesByTime = (salesData, period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return salesData.filter(sale => {
      const saleDate = new Date(sale.date);

      switch (period) {
        case 'day':
          return saleDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return saleDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return saleDate >= yearAgo;
        default:
          return true;
      }
    });
  };

  // Calculate statistics for all employees
  const calculateAllEmployeesStats = () => {
    const filteredSales = filterSalesByTime(sales, timeFilter);
    const employeeStats = {};

    filteredSales.forEach(sale => {
      if (!employeeStats[sale.employee]) {
        employeeStats[sale.employee] = {
          totalSales: 0,
          totalAmount: 0,
          byCategory: { vehicle: 0, motorbike: 0, carpet: 0 }
        };
      }
      employeeStats[sale.employee].totalSales++;
      employeeStats[sale.employee].totalAmount += parseFloat(sale.amount || 0);
      if (sale.category) {
        employeeStats[sale.employee].byCategory[sale.category] =
          (employeeStats[sale.employee].byCategory[sale.category] || 0) + parseFloat(sale.amount || 0);
      }
    });

    return employeeStats;
  };

  // Calculate statistics for selected employee
  const calculateEmployeeStats = (employeeName) => {
    const employeeSales = sales.filter(s => s.employee === employeeName);
    const filteredSales = filterSalesByTime(employeeSales, timeFilter);

    const stats = {
      totalSales: filteredSales.length,
      totalAmount: filteredSales.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0),
      byService: {}
    };

    filteredSales.forEach(sale => {
      const serviceKey = sale.serviceType || 'Other';
      if (!stats.byService[serviceKey]) {
        stats.byService[serviceKey] = {
          count: 0,
          amount: 0,
          category: sale.category
        };
      }
      stats.byService[serviceKey].count++;
      stats.byService[serviceKey].amount += parseFloat(sale.amount || 0);
    });

    return stats;
  };

  // Get sales for selected employee and service
  const getEmployeeServiceSales = () => {
    if (!selectedEmployee || !selectedServiceType) return [];

    return sales
      .filter(s => s.employee === selectedEmployee && s.serviceType === selectedServiceType)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Latest to oldest
  };

  // Calculate total sales based on selected time filter
  const filteredSalesForTotal = filterSalesByTime(sales, timeFilter);
  const totalSales = filteredSalesForTotal.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);

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
              <div className="text-sm text-gray-500">
                Total Sales ({timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)})
              </div>
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
                          Vehicle Service Type * (Select all that apply)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                          {vehicleServiceTypes.map((service) => (
                            <label key={service} className="flex items-center gap-2 p-3 sm:p-2 hover:bg-white rounded cursor-pointer transition-colors min-h-[44px]">
                              <input
                                type="checkbox"
                                checked={form.vehicleServiceType.includes(service)}
                                onChange={() => handleServiceTypeCheckbox('vehicleServiceType', service)}
                                className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-700">{service}</span>
                            </label>
                          ))}
                        </div>
                        {form.vehicleServiceType.length > 0 && (
                          <div className="mt-2 text-sm text-blue-600 break-words">
                            ✓ Selected: {form.vehicleServiceType.join(', ')}
                          </div>
                        )}
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
                          Motorbike Service Type * (Select all that apply)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                          {motorbikeServiceTypes.map((service) => (
                            <label key={service} className="flex items-center gap-2 p-3 sm:p-2 hover:bg-white rounded cursor-pointer transition-colors min-h-[44px]">
                              <input
                                type="checkbox"
                                checked={form.motorbikeServiceType.includes(service)}
                                onChange={() => handleServiceTypeCheckbox('motorbikeServiceType', service)}
                                className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-700">{service}</span>
                            </label>
                          ))}
                        </div>
                        {form.motorbikeServiceType.length > 0 && (
                          <div className="mt-2 text-sm text-blue-600 break-words">
                            ✓ Selected: {form.motorbikeServiceType.join(', ')}
                          </div>
                        )}
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
                          Carpet Service Type * (Select all that apply)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                          {carpetServiceTypes.map((service) => (
                            <label key={service} className="flex items-center gap-2 p-3 sm:p-2 hover:bg-white rounded cursor-pointer transition-colors min-h-[44px]">
                              <input
                                type="checkbox"
                                checked={form.carpetServiceType.includes(service)}
                                onChange={() => handleServiceTypeCheckbox('carpetServiceType', service)}
                                className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                              />
                              <span className="text-sm text-gray-700">{service}</span>
                            </label>
                          ))}
                        </div>
                        {form.carpetServiceType.length > 0 && (
                          <div className="mt-2 text-sm text-blue-600 break-words">
                            ✓ Selected: {form.carpetServiceType.join(', ')}
                          </div>
                        )}
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

        {/* Sales History Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Time Filter Tabs */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">📊 Sales History</h2>
            <div className="flex gap-2">
              {['day', 'week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeFilter === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💰</div>
              <p>No sales recorded yet. Add your first sale above!</p>
            </div>
          ) : !selectedEmployee ? (
            // Dashboard for all employees
            <div>
              {(() => {
                const stats = calculateAllEmployeesStats();
                const employeeList = Object.entries(stats);

                if (employeeList.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📊</div>
                      <p>No sales data for this period</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Total Revenue</div>
                        <div className="text-2xl font-bold text-green-700">
                          KSh {employeeList.reduce((sum, [, data]) => sum + data.totalAmount, 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Total Sales</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {employeeList.reduce((sum, [, data]) => sum + data.totalSales, 0)}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">Active Employees</div>
                        <div className="text-2xl font-bold text-purple-700">
                          {employeeList.length}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-700 mb-3">Employee Performance</h3>
                    <div className="space-y-3">
                      {employeeList
                        .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
                        .map(([employeeName, data]) => (
                          <div key={employeeName} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">👨‍🔧</div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">{employeeName}</h4>
                                  <p className="text-sm text-gray-500">{data.totalSales} sales</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                  KSh {data.totalAmount.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <div className="text-xs text-blue-600">🚗 Vehicles</div>
                                <div className="font-semibold text-blue-700">
                                  KSh {(data.byCategory.vehicle || 0).toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-orange-50 p-2 rounded text-center">
                                <div className="text-xs text-orange-600">🏍️ Motorbikes</div>
                                <div className="font-semibold text-orange-700">
                                  KSh {(data.byCategory.motorbike || 0).toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-purple-50 p-2 rounded text-center">
                                <div className="text-xs text-purple-600">🧺 Carpets</div>
                                <div className="font-semibold text-purple-700">
                                  KSh {(data.byCategory.carpet || 0).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : !selectedServiceType ? (
            // Dashboard for selected employee
            <div>
              {(() => {
                const stats = calculateEmployeeStats(selectedEmployee);
                const serviceList = Object.entries(stats.byService);

                if (serviceList.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📊</div>
                      <p>No sales data for this employee in this period</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Total Revenue</div>
                        <div className="text-2xl font-bold text-green-700">
                          KSh {stats.totalAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Total Sales</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {stats.totalSales}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-700 mb-3">Performance by Service</h3>
                    <div className="space-y-3">
                      {serviceList
                        .sort((a, b) => b[1].amount - a[1].amount)
                        .map(([serviceName, data]) => (
                          <div key={serviceName} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="text-2xl">
                                  {data.category === 'vehicle' && '🚗'}
                                  {data.category === 'motorbike' && '🏍️'}
                                  {data.category === 'carpet' && '🧺'}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800">{serviceName}</h4>
                                  <p className="text-sm text-gray-500">{data.count} sales</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                  KSh {data.amount.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Avg: KSh {(data.amount / data.count).toFixed(0)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            // Sales list for selected employee and service (daily summary)
            <div>
              {(() => {
                const serviceSales = getEmployeeServiceSales();
                const today = new Date().toISOString().split('T')[0];
                const todaySales = serviceSales.filter(s => s.date === today);
                const todayTotal = todaySales.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

                return (
                  <div className="space-y-4">
                    {/* Today's Summary */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-green-600 font-medium">Today's {selectedServiceType}</div>
                          <div className="text-lg font-semibold text-green-700">
                            {todaySales.length} sales • KSh {todayTotal.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-3xl">📅</div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-700">Sales Records (Latest First)</h3>

                    {serviceSales.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">💰</div>
                        <p>No sales recorded for this service yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {serviceSales.map((sale) => (
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
                                    {sale.category === 'vehicle' ? sale.vehicle_model :
                                      sale.category === 'motorbike' ? `${sale.number_of_motorbikes} Motorbike${sale.number_of_motorbikes > 1 ? 's' : ''}` :
                                        sale.category === 'carpet' ? `${sale.size} Carpet/Rug` :
                                          sale.description}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${sale.payment_method === "Cash" ? "bg-green-100 text-green-800" :
                                      sale.payment_method === "M-Pesa" ? "bg-blue-100 text-blue-800" :
                                        sale.payment_method === "Card" ? "bg-purple-100 text-purple-800" :
                                          "bg-orange-100 text-orange-800"
                                    }`}>
                                    {sale.payment_method}
                                  </span>
                                </div>

                                {/* Service details */}
                                <div className="text-sm text-gray-600 mb-1">
                                  🧽 {sale.service_type}
                                  {sale.category === 'vehicle' && sale.vehicle_service_type && ` • ${sale.vehicle_service_type}`}
                                  {sale.category === 'motorbike' && sale.motorbike_service_type && ` • ${sale.motorbike_service_type}`}
                                  {sale.category === 'carpet' && sale.carpet_service_type && ` • ${sale.carpet_service_type}`}
                                </div>

                                <div className="text-sm text-gray-600">
                                  📅 {new Date(sale.date).toLocaleDateString()}
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
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}