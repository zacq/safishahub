import { useState, useEffect } from "react";
import { employeesService, expensesService, salesService } from '../services/supabaseService';

export default function Admin({ onNavigate }) {
  const [adminData, setAdminData] = useState({
    expenses: [],
    notes: [],
    employees: []
  });

  const [sales, setSales] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [expenseForm, setExpenseForm] = useState({ name: "", amount: "" });
  const [noteForm, setNoteForm] = useState({ category: "Incident", content: "" });
  const [employeeForm, setEmployeeForm] = useState({ name: "", phone: "", email: "", idNumber: "", image: "" });

  // Load all data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load employees and expenses in parallel
        const [employees, expenses] = await Promise.all([
          employeesService.getAll(),
          expensesService.getAll()
        ]);

        setAdminData(prev => ({
          ...prev,
          employees: employees,
          expenses: expenses
        }));
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem("adminData");
        if (saved) {
          setAdminData(JSON.parse(saved));
        }
      }
    };
    loadData();
  }, []);

  // Load sales data from Supabase on mount
  useEffect(() => {
    const loadSales = async () => {
      try {
        const salesData = await salesService.getAll();
        setSales(salesData);
      } catch (error) {
        console.error('Error loading sales:', error);
        // Fallback to localStorage
        const savedSales = localStorage.getItem("dailySales");
        if (savedSales) {
          setSales(JSON.parse(savedSales));
        }
      }
    };
    loadSales();
  }, []);

  // Save admin data to localStorage
  useEffect(() => {
    localStorage.setItem("adminData", JSON.stringify(adminData));
  }, [adminData]);

  // Calculate analytics based on selected employee and date
  const getAnalytics = () => {
    let filteredSales = sales;

    // Filter by date
    if (selectedDate) {
      filteredSales = filteredSales.filter(sale => sale.date === selectedDate);
    }

    // Filter by employee
    if (selectedEmployee !== "all") {
      filteredSales = filteredSales.filter(sale => sale.employee === selectedEmployee);
    }

    // Calculate metrics
    const vehicleSales = filteredSales.filter(s => s.category === "vehicle");
    const motorbikeSales = filteredSales.filter(s => s.category === "motorbike");
    const carpetSales = filteredSales.filter(s => s.category === "carpet");

    const vehicleCount = vehicleSales.length;
    const motorbikeCount = motorbikeSales.reduce((sum, s) => sum + (parseInt(s.numberOfMotorbikes) || 1), 0);
    const carpetCount = carpetSales.length;

    const vehicleRevenue = vehicleSales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    const motorbikeRevenue = motorbikeSales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    const carpetRevenue = carpetSales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

    const totalRevenue = vehicleRevenue + motorbikeRevenue + carpetRevenue;
    const totalServices = vehicleCount + motorbikeCount + carpetCount;

    // Get service type breakdown
    const vehicleServiceBreakdown = {};
    vehicleSales.forEach(s => {
      const service = s.vehicleServiceType || "Unknown";
      vehicleServiceBreakdown[service] = (vehicleServiceBreakdown[service] || 0) + 1;
    });

    const motorbikeServiceBreakdown = {};
    motorbikeSales.forEach(s => {
      const service = s.motorbikeServiceType || "Unknown";
      motorbikeServiceBreakdown[service] = (motorbikeServiceBreakdown[service] || 0) + 1;
    });

    const carpetServiceBreakdown = {};
    carpetSales.forEach(s => {
      const service = s.carpetServiceType || "Unknown";
      carpetServiceBreakdown[service] = (carpetServiceBreakdown[service] || 0) + 1;
    });

    return {
      vehicleCount,
      motorbikeCount,
      carpetCount,
      vehicleRevenue,
      motorbikeRevenue,
      carpetRevenue,
      totalRevenue,
      totalServices,
      vehicleServiceBreakdown,
      motorbikeServiceBreakdown,
      carpetServiceBreakdown,
      filteredSales
    };
  };

  const analytics = getAnalytics();

  // Add expense
  const addExpense = async (e) => {
    e.preventDefault();
    if (expenseForm.name && expenseForm.amount) {
      try {
        const newExpense = {
          category: 'Other', // Default category
          amount: parseFloat(expenseForm.amount),
          description: expenseForm.name,
          employee_id: null // You can add employee selection later
        };

        // Save to Supabase
        const savedExpense = await expensesService.create(newExpense);

        // Update local state
        setAdminData({
          ...adminData,
          expenses: [savedExpense, ...adminData.expenses]
        });

        setExpenseForm({ name: "", amount: "" });
        alert('Expense added successfully!');
      } catch (error) {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
      }
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      // Delete from Supabase
      await expensesService.delete(id);

      // Update local state
      setAdminData({
        ...adminData,
        expenses: adminData.expenses.filter(exp => exp.id !== id)
      });

      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  // Add note
  const addNote = (e) => {
    e.preventDefault();
    if (noteForm.content) {
      const newNote = {
        id: Date.now().toString(),
        category: noteForm.category,
        content: noteForm.content,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };
      setAdminData({
        ...adminData,
        notes: [newNote, ...adminData.notes]
      });
      setNoteForm({ category: "Incident", content: "" });
    }
  };

  // Delete note
  const deleteNote = (id) => {
    setAdminData({
      ...adminData,
      notes: adminData.notes.filter(note => note.id !== id)
    });
  };

  // Handle employee image upload
  const handleEmployeeImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmployeeForm({ ...employeeForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add employee
  const addEmployee = async (e) => {
    e.preventDefault();
    if (employeeForm.name && employeeForm.phone && employeeForm.idNumber) {
      try {
        const newEmployee = {
          name: employeeForm.name,
          phone: employeeForm.phone,
          id_number: employeeForm.idNumber,
          role: 'Other', // Default role, you can add a role field to the form
          salary: 0, // Default salary, you can add a salary field to the form
          photo_url: employeeForm.image || null
        };

        // Save to Supabase
        const savedEmployee = await employeesService.create(newEmployee);

        // Update local state with the saved employee
        setAdminData({
          ...adminData,
          employees: [savedEmployee, ...adminData.employees]
        });

        // Clear form
        setEmployeeForm({ name: "", phone: "", email: "", idNumber: "", image: "" });

        alert('Employee added successfully!');
      } catch (error) {
        console.error('Error adding employee:', error);
        alert('Failed to add employee. Please try again.');
      }
    }
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    try {
      // Delete from Supabase
      await employeesService.delete(id);

      // Update local state
      setAdminData({
        ...adminData,
        employees: adminData.employees.filter(emp => emp.id !== id)
      });

      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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
                <h1 className="text-2xl font-bold text-gray-800">⚙️ Admin Panel</h1>
                <p className="text-sm text-gray-600">Daily Operations Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Analytics Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            📊 Daily Sales Analytics Dashboard
          </h2>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Select Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Employees</option>
                {adminData.employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overall Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Total Services</div>
              <div className="text-3xl font-bold text-blue-600">{analytics.totalServices}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">KSh {analytics.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
              <div className="text-sm text-gray-600 mb-1">Avg per Service</div>
              <div className="text-2xl font-bold text-purple-600">
                KSh {analytics.totalServices > 0 ? Math.round(analytics.totalRevenue / analytics.totalServices).toLocaleString() : 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
              <div className="text-sm text-gray-600 mb-1">Transactions</div>
              <div className="text-3xl font-bold text-orange-600">{analytics.filteredSales.length}</div>
            </div>
          </div>

          {/* Service Category Breakdown */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Vehicle Services */}
            <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">🚗 Vehicle Wash</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Services</div>
                  <div className="text-2xl font-bold text-blue-600">{analytics.vehicleCount}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Revenue</div>
                  <div className="text-xl font-bold text-green-600">KSh {analytics.vehicleRevenue.toLocaleString()}</div>
                </div>
                {Object.keys(analytics.vehicleServiceBreakdown).length > 0 && (
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Service Types:</div>
                    <div className="space-y-1">
                      {Object.entries(analytics.vehicleServiceBreakdown).map(([service, count]) => (
                        <div key={service} className="flex justify-between text-xs">
                          <span className="text-gray-700">{service}</span>
                          <span className="font-semibold text-blue-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Motorbike Services */}
            <div className="bg-orange-50 rounded-lg p-5 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">🏍️ Motorbike Wash</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Services</div>
                  <div className="text-2xl font-bold text-orange-600">{analytics.motorbikeCount}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Revenue</div>
                  <div className="text-xl font-bold text-green-600">KSh {analytics.motorbikeRevenue.toLocaleString()}</div>
                </div>
                {Object.keys(analytics.motorbikeServiceBreakdown).length > 0 && (
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Service Types:</div>
                    <div className="space-y-1">
                      {Object.entries(analytics.motorbikeServiceBreakdown).map(([service, count]) => (
                        <div key={service} className="flex justify-between text-xs">
                          <span className="text-gray-700">{service}</span>
                          <span className="font-semibold text-orange-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Carpet Services */}
            <div className="bg-teal-50 rounded-lg p-5 border-2 border-teal-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">🧺 Carpet/Rug Wash</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Services</div>
                  <div className="text-2xl font-bold text-teal-600">{analytics.carpetCount}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-xs text-gray-600">Revenue</div>
                  <div className="text-xl font-bold text-green-600">KSh {analytics.carpetRevenue.toLocaleString()}</div>
                </div>
                {Object.keys(analytics.carpetServiceBreakdown).length > 0 && (
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Service Types:</div>
                    <div className="space-y-1">
                      {Object.entries(analytics.carpetServiceBreakdown).map(([service, count]) => (
                        <div key={service} className="flex justify-between text-xs">
                          <span className="text-gray-700">{service}</span>
                          <span className="font-semibold text-teal-600">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          {analytics.filteredSales.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">📝 Recent Transactions</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analytics.filteredSales.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {sale.category === "vehicle" ? "🚗" : sale.category === "motorbike" ? "🏍️" : "🧺"}
                        </span>
                        <div>
                          <div className="font-medium text-gray-800">
                            {sale.category === "vehicle" && sale.vehicleServiceType}
                            {sale.category === "motorbike" && sale.motorbikeServiceType}
                            {sale.category === "carpet" && sale.carpetServiceType}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sale.employee} • {sale.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">KSh {parseFloat(sale.amount).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{sale.paymentMethod}</div>
                    </div>
                  </div>
                ))}
              </div>
              {analytics.filteredSales.length > 10 && (
                <div className="text-center text-sm text-gray-500 mt-3">
                  ... and {analytics.filteredSales.length - 10} more transactions
                </div>
              )}
            </div>
          )}

          {analytics.filteredSales.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg">No sales data for selected filters</p>
              <p className="text-sm">Try selecting a different date or employee</p>
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            💸 Daily Expenses
          </h2>

          <form onSubmit={addExpense} className="mb-4">
            <div className="grid md:grid-cols-3 gap-3">
              <input
                type="text"
                value={expenseForm.name}
                onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                placeholder="Expense name"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
              <input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="Amount (KSh)"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                + Add Expense
              </button>
            </div>
          </form>

          {adminData.expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💸</div>
              <p>No expenses recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {adminData.expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{expense.name}</div>
                    <div className="text-sm text-gray-500">{expense.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-red-600">KSh {parseInt(expense.amount).toLocaleString()}</div>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 text-xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total Expenses:</span>
                  <span className="text-xl font-bold text-red-600">
                    KSh {adminData.expenses.reduce((sum, exp) => sum + (parseInt(exp.amount) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Management Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            👥 Employee Management
          </h2>

          <form onSubmit={addEmployee} className="mb-4">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                placeholder="Full Name *"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
              <input
                type="tel"
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                placeholder="Phone Number *"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
              <input
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                placeholder="Email (optional)"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <input
                type="text"
                value={employeeForm.idNumber}
                onChange={(e) => setEmployeeForm({ ...employeeForm, idNumber: e.target.value })}
                placeholder="ID Number *"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Photo (optional)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEmployeeImageUpload}
                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                {employeeForm.image && (
                  <div className="relative">
                    <img
                      src={employeeForm.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setEmployeeForm({ ...employeeForm, image: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max size: 2MB. Formats: JPG, PNG, GIF</p>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              + Add Employee
            </button>
          </form>

          {adminData.employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">👥</div>
              <p>No employees added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminData.employees.map((employee) => (
                <div key={employee.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Employee Image */}
                  <div className="flex-shrink-0">
                    {employee.image ? (
                      <img
                        src={employee.image}
                        alt={employee.name}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-purple-100 flex items-center justify-center text-3xl">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Employee Details */}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-lg">👨‍🔧 {employee.name}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2">
                      <div className="text-sm text-gray-600">📱 {employee.phone}</div>
                      {employee.email && <div className="text-sm text-gray-600">📧 {employee.email}</div>}
                      <div className="text-sm text-gray-600">🆔 {employee.idNumber}</div>
                      <div className="text-xs text-gray-500">Added: {employee.dateAdded}</div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteEmployee(employee.id)}
                    className="text-red-500 hover:text-red-700 text-2xl flex-shrink-0"
                    title="Delete employee"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total Employees:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {adminData.employees.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📝 Notes
          </h2>

          <form onSubmit={addNote} className="mb-4">
            <div className="space-y-3">
              <select
                value={noteForm.category}
                onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="Incident">🚨 Incident</option>
                <option value="Resource Usage">📦 Resource Usage</option>
                <option value="Client Query">❓ Client Query</option>
                <option value="Dissatisfied Clients">😞 Dissatisfied Clients</option>
              </select>
              <textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                placeholder="Enter note details..."
                rows="3"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                + Add Note
              </button>
            </div>
          </form>

          {adminData.notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>No notes recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminData.notes.map((note) => (
                <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      note.category === "Incident" ? "bg-red-100 text-red-800" :
                      note.category === "Resource Usage" ? "bg-blue-100 text-blue-800" :
                      note.category === "Client Query" ? "bg-yellow-100 text-yellow-800" :
                      "bg-orange-100 text-orange-800"
                    }`}>
                      {note.category}
                    </span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-500 hover:text-red-700 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-gray-800 mb-2">{note.content}</p>
                  <div className="text-xs text-gray-500">
                    {note.date} at {note.time}
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

