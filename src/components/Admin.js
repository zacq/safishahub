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

  // Sales history modal state
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState(null); // 'vehicle', 'motorbike', 'carpet'
  const [editingSale, setEditingSale] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Sales history date/period filter state
  const [historyFilterPeriod, setHistoryFilterPeriod] = useState('day'); // 'day', 'week', 'month', 'year'
  const [historyFilterDate, setHistoryFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Employee management state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);

  // Expense management state
  const [selectedExpenseDate, setSelectedExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editExpenseForm, setEditExpenseForm] = useState({ description: "", amount: "" });

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

  // Start editing expense
  const startEditExpense = (expense) => {
    setEditingExpense(expense.id);
    setEditExpenseForm({
      description: expense.description || expense.name,
      amount: expense.amount
    });
  };

  // Cancel editing expense
  const cancelEditExpense = () => {
    setEditingExpense(null);
    setEditExpenseForm({ description: "", amount: "" });
  };

  // Save edited expense
  const saveEditedExpense = async (expenseId) => {
    try {
      console.log('Saving expense with ID:', expenseId);
      console.log('Expense form data:', editExpenseForm);

      // Build update data for Supabase
      const updateData = {
        description: editExpenseForm.description,
        amount: parseFloat(editExpenseForm.amount)
      };

      console.log('Update data to send:', updateData);

      // Update in Supabase
      const updatedExpense = await expensesService.update(expenseId, updateData);

      console.log('Updated expense:', updatedExpense);

      // Update local state
      setAdminData({
        ...adminData,
        expenses: adminData.expenses.map(exp =>
          exp.id === expenseId ? { ...exp, ...updateData } : exp
        )
      });

      setEditingExpense(null);
      setEditExpenseForm({ description: "", amount: "" });
      alert('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense:', error);
      console.error('Error details:', error.message);
      alert(`Failed to update expense: ${error.message}`);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }

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

  // Start editing employee
  const startEditEmployee = (employee) => {
    setEditingEmployee(employee.id);
    setEmployeeForm({
      name: employee.name,
      phone: employee.phone,
      email: employee.email || '',
      idNumber: employee.idNumber,
      image: employee.image || ''
    });
  };

  // Cancel editing employee
  const cancelEditEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({ name: "", phone: "", email: "", idNumber: "", image: "" });
  };

  // Save edited employee
  const saveEditedEmployee = async (employeeId) => {
    try {
      console.log('Saving employee with ID:', employeeId);
      console.log('Employee form data:', employeeForm);

      // Build update data with snake_case for Supabase (only columns that exist)
      const updateData = {
        name: employeeForm.name,
        phone: employeeForm.phone,
        id_number: employeeForm.idNumber
      };

      // Add photo_url if image exists
      if (employeeForm.image) {
        updateData.photo_url = employeeForm.image;
      }

      console.log('Update data to send:', updateData);

      // Update in Supabase
      const updatedEmployee = await employeesService.update(employeeId, updateData);

      console.log('Updated employee:', updatedEmployee);

      // Update local state with camelCase
      const localUpdateData = {
        name: employeeForm.name,
        phone: employeeForm.phone,
        idNumber: employeeForm.idNumber
      };

      if (employeeForm.image) {
        localUpdateData.image = employeeForm.image;
      }

      setAdminData({
        ...adminData,
        employees: adminData.employees.map(emp =>
          emp.id === employeeId ? { ...emp, ...localUpdateData } : emp
        )
      });

      setEditingEmployee(null);
      setEmployeeForm({ name: "", phone: "", email: "", idNumber: "", image: "" });
      alert('Employee updated successfully!');
    } catch (error) {
      console.error('Error updating employee:', error);
      console.error('Error details:', error.message);
      alert(`Failed to update employee: ${error.message}`);
    }
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from Supabase
      await employeesService.delete(id);

      // Update local state
      setAdminData({
        ...adminData,
        employees: adminData.employees.filter(emp => emp.id !== id)
      });

      // Clear selection if deleted employee was selected
      if (selectedEmployeeId === id) {
        setSelectedEmployeeId("");
      }

      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  // Open sales history for a specific service category
  const openSalesHistory = (category) => {
    setSelectedServiceCategory(category);
    setShowSalesHistory(true);
  };

  // Get filtered sales for the selected service category
  const getServiceSales = () => {
    if (!selectedServiceCategory) return [];

    let filteredSales = sales.filter(sale => sale.category === selectedServiceCategory);

    // Apply date/period filter for sales history modal
    if (showSalesHistory) {
      const { startDate, endDate } = getDateRangeForPeriod(historyFilterPeriod, historyFilterDate);
      filteredSales = filteredSales.filter(sale => {
        return sale.date >= startDate && sale.date <= endDate;
      });
    } else {
      // Apply single date filter for other views
      if (selectedDate) {
        filteredSales = filteredSales.filter(sale => sale.date === selectedDate);
      }
    }

    // Apply employee filter
    if (selectedEmployee !== "all") {
      filteredSales = filteredSales.filter(sale => sale.employee === selectedEmployee);
    }

    return filteredSales;
  };

  // Helper function to extract time from timestamp
  const formatTimeOnly = (timestamp) => {
    if (!timestamp) return 'N/A';

    // If timestamp is an ISO string or contains 'T', extract time portion
    if (timestamp.includes('T')) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }

    // If it's already just a time string (HH:MM:SS), return as is
    if (timestamp.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timestamp;
    }

    // If it contains date and time separated by space or 'T'
    const timePart = timestamp.split(/[T\s]/)[1];
    if (timePart) {
      // Remove timezone info if present
      return timePart.split(/[+-]/)[0].substring(0, 8);
    }

    return timestamp;
  };

  // Calculate date range based on period and selected date
  const getDateRangeForPeriod = (period, selectedDate) => {
    const date = new Date(selectedDate);
    let startDate, endDate;

    switch (period) {
      case 'day':
        startDate = selectedDate;
        endDate = selectedDate;
        break;

      case 'week':
        // Get the start of the week (Sunday)
        const dayOfWeek = date.getDay();
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - dayOfWeek);
        startDate = startOfWeek.toISOString().split('T')[0];

        // Get the end of the week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endDate = endOfWeek.toISOString().split('T')[0];
        break;

      case 'month':
        // Get the first day of the month
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        startDate = startOfMonth.toISOString().split('T')[0];

        // Get the last day of the month
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endDate = endOfMonth.toISOString().split('T')[0];
        break;

      case 'year':
        // Get the first day of the year
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        startDate = startOfYear.toISOString().split('T')[0];

        // Get the last day of the year
        const endOfYear = new Date(date.getFullYear(), 11, 31);
        endDate = endOfYear.toISOString().split('T')[0];
        break;

      default:
        startDate = selectedDate;
        endDate = selectedDate;
    }

    return { startDate, endDate };
  };

  // Group sales by employee
  const getGroupedSalesByEmployee = () => {
    const serviceSales = getServiceSales();

    // Group sales by employee name
    const grouped = serviceSales.reduce((acc, sale) => {
      const employeeName = sale.employee || 'Unknown';
      if (!acc[employeeName]) {
        acc[employeeName] = [];
      }
      acc[employeeName].push(sale);
      return acc;
    }, {});

    // Convert to array and sort by employee name
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  // Start editing a sale
  const startEditSale = (sale) => {
    setEditingSale(sale.id);
    setEditForm({
      amount: sale.amount,
      vehicleServiceType: sale.vehicleServiceType || '',
      motorbikeServiceType: sale.motorbikeServiceType || '',
      carpetServiceType: sale.carpetServiceType || '',
      vehicleModel: sale.vehicleModel || '',
      numberOfMotorbikes: sale.numberOfMotorbikes || '',
      size: sale.size || '',
      paymentMethod: sale.paymentMethod || 'Cash'
    });
  };

  // Cancel editing
  const cancelEditSale = () => {
    setEditingSale(null);
    setEditForm({});
  };

  // Save edited sale
  const saveEditedSale = async (saleId) => {
    try {
      console.log('Saving sale with ID:', saleId);
      console.log('Edit form data:', editForm);
      console.log('Selected service category:', selectedServiceCategory);

      // Build update data with snake_case column names for Supabase
      const updateData = {
        amount: editForm.amount,
        payment_method: editForm.paymentMethod
      };

      // Add service-specific fields with snake_case
      if (selectedServiceCategory === 'vehicle') {
        updateData.vehicle_service_type = editForm.vehicleServiceType;
        if (editForm.vehicleModel) updateData.vehicle_model = editForm.vehicleModel;
      } else if (selectedServiceCategory === 'motorbike') {
        updateData.motorbike_service_type = editForm.motorbikeServiceType;
        if (editForm.numberOfMotorbikes) updateData.number_of_motorbikes = editForm.numberOfMotorbikes;
      } else if (selectedServiceCategory === 'carpet') {
        updateData.carpet_service_type = editForm.carpetServiceType;
        if (editForm.size) updateData.size = editForm.size;
      }

      console.log('Update data to send:', updateData);

      // Update in Supabase
      const updatedSale = await salesService.update(saleId, updateData);

      console.log('Updated sale:', updatedSale);

      // Update local state with camelCase for consistency
      const localUpdateData = {
        amount: editForm.amount,
        paymentMethod: editForm.paymentMethod
      };

      if (selectedServiceCategory === 'vehicle') {
        localUpdateData.vehicleServiceType = editForm.vehicleServiceType;
        if (editForm.vehicleModel) localUpdateData.vehicleModel = editForm.vehicleModel;
      } else if (selectedServiceCategory === 'motorbike') {
        localUpdateData.motorbikeServiceType = editForm.motorbikeServiceType;
        if (editForm.numberOfMotorbikes) localUpdateData.numberOfMotorbikes = editForm.numberOfMotorbikes;
      } else if (selectedServiceCategory === 'carpet') {
        localUpdateData.carpetServiceType = editForm.carpetServiceType;
        if (editForm.size) localUpdateData.size = editForm.size;
      }

      setSales(sales.map(sale =>
        sale.id === saleId ? { ...sale, ...localUpdateData } : sale
      ));

      setEditingSale(null);
      setEditForm({});
      alert('Sale updated successfully!');
    } catch (error) {
      console.error('Error updating sale:', error);
      console.error('Error details:', error.message);
      alert(`Failed to update sale: ${error.message}`);
    }
  };

  // Delete sale
  const deleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale record? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting sale with ID:', saleId);

      // Delete from Supabase
      await salesService.delete(saleId);

      // Update local state
      setSales(sales.filter(sale => sale.id !== saleId));

      // Close modal if no more sales
      if (getServiceSales().length <= 1) {
        setShowSalesHistory(false);
      }

      alert('Sale deleted successfully!');
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert(`Failed to delete sale: ${error.message}`);
    }
  };

  // Mark carpet as returned
  const markCarpetAsReturned = async (saleId) => {
    if (!window.confirm('Mark this carpet as returned to the customer?')) {
      return;
    }

    try {
      console.log('Marking carpet as returned with ID:', saleId);

      // Update in Supabase
      const updatedSale = await salesService.markAsReturned(saleId);

      // Update local state
      setSales(sales.map(sale =>
        sale.id === saleId ? {
          ...sale,
          returned: true,
          returnedDate: updatedSale.returned_date || new Date().toISOString()
        } : sale
      ));

      alert('✅ Carpet marked as returned successfully!');
    } catch (error) {
      console.error('Error marking carpet as returned:', error);
      alert(`Failed to mark carpet as returned: ${error.message}`);
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
                <button
                  onClick={() => openSalesHistory('vehicle')}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  📋 View Sales History
                </button>
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
                <button
                  onClick={() => openSalesHistory('motorbike')}
                  className="w-full bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
                >
                  📋 View Sales History
                </button>
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
                <button
                  onClick={() => openSalesHistory('carpet')}
                  className="w-full bg-teal-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                >
                  📋 View Sales History
                </button>
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
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            <span>
                              {sale.category === "vehicle" && sale.vehicleServiceType}
                              {sale.category === "motorbike" && sale.motorbikeServiceType}
                              {sale.category === "carpet" && sale.carpetServiceType}
                            </span>
                            {/* Return status badge for carpets */}
                            {sale.category === 'carpet' && (
                              sale.returned ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  ✅ Returned
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full animate-pulse">
                                  🕐 At Car Wash
                                </span>
                              )
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sale.employee} • {formatTimeOnly(sale.timestamp)}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              💸 Daily Expenses
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">📅 Filter by Date:</label>
              <input
                type="date"
                value={selectedExpenseDate}
                onChange={(e) => setSelectedExpenseDate(e.target.value)}
                className="p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

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

          {(() => {
            // Filter expenses by selected date
            const filteredExpenses = adminData.expenses.filter(expense => {
              if (!selectedExpenseDate) return true;

              const expenseDate = expense.created_at
                ? new Date(expense.created_at).toISOString().split('T')[0]
                : expense.date;

              return expenseDate === selectedExpenseDate;
            });

            if (filteredExpenses.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💸</div>
                  <p>No expenses recorded for this date</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    {editingExpense === expense.id ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Expense Name</label>
                            <input
                              type="text"
                              value={editExpenseForm.description}
                              onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
                              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Amount (KSh)</label>
                            <input
                              type="number"
                              value={editExpenseForm.amount}
                              onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: e.target.value })}
                              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={cancelEditExpense}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEditedExpense(expense.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                          >
                            💾 Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-lg">{expense.description || expense.name}</div>
                          <div className="text-sm text-gray-500">
                            📅 {expense.created_at
                              ? new Date(expense.created_at).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : expense.date || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-red-600">KSh {parseInt(expense.amount).toLocaleString()}</div>
                          <button
                            onClick={() => startEditExpense(expense)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 text-lg">Total Expenses:</span>
                    <span className="text-2xl font-bold text-red-600">
                      KSh {filteredExpenses.reduce((sum, exp) => sum + (parseInt(exp.amount) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Employee Management Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              👥 Employee Management
            </h2>
            <button
              onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {showAddEmployeeForm ? '✕ Cancel' : '+ Add Employee'}
            </button>
          </div>

          {/* Add Employee Form (Collapsible) */}
          {showAddEmployeeForm && (
            <form onSubmit={addEmployee} className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
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
              💾 Save Employee
            </button>
          </form>
          )}

          {/* Employee List Section */}
          {adminData.employees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-lg font-medium">No employees added yet</p>
              <p className="text-sm">Click "+ Add Employee" to get started</p>
            </div>
          ) : (
            <div>
              {/* Employee Selector Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee to View/Edit
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    setEditingEmployee(null);
                    setEmployeeForm({ name: "", phone: "", email: "", idNumber: "", image: "" });
                  }}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                >
                  <option value="">-- Select an employee --</option>
                  {adminData.employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Employee Details */}
              {selectedEmployeeId && (() => {
                const employee = adminData.employees.find(e => e.id === selectedEmployeeId);
                if (!employee) return null;

                return (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                    {editingEmployee === employee.id ? (
                      /* Edit Mode */
                      <div>
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">✏️ Edit Employee Details</h3>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                              <input
                                type="text"
                                value={employeeForm.name}
                                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                              <input
                                type="tel"
                                value={employeeForm.phone}
                                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                              <input
                                type="text"
                                value={employeeForm.idNumber}
                                onChange={(e) => setEmployeeForm({ ...employeeForm, idNumber: e.target.value })}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={cancelEditEmployee}
                              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEditedEmployee(employee.id)}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                              💾 Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div>
                        <div className="flex items-start gap-6 mb-6">
                          {/* Employee Photo */}
                          <div className="flex-shrink-0">
                            {employee.image ? (
                              <img
                                src={employee.image}
                                alt={employee.name}
                                className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-6xl border-4 border-white shadow-lg">
                                👤
                              </div>
                            )}
                          </div>

                          {/* Employee Info */}
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">
                              👨‍🔧 {employee.name}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-purple-600 font-semibold">📱 Phone:</span>
                                <span className="text-gray-700">{employee.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-purple-600 font-semibold">🆔 ID Number:</span>
                                <span className="text-gray-700">{employee.idNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-purple-600 font-semibold">📅 Added:</span>
                                <span className="text-gray-700">{employee.dateAdded || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end pt-4 border-t-2 border-purple-200">
                          <button
                            onClick={() => startEditEmployee(employee)}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteEmployee(employee.id)}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Total Employees Counter */}
              <div className="mt-6 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 text-lg">Total Employees:</span>
                  <span className="text-2xl font-bold text-purple-600">
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

        {/* Sales History Modal */}
        {showSalesHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 pr-2">
                    <h2 className="text-base sm:text-2xl font-bold leading-tight">
                      {selectedServiceCategory === 'vehicle' && '🚗 Vehicle Wash Sales History'}
                      {selectedServiceCategory === 'motorbike' && '🏍️ Motorbike Wash Sales History'}
                      {selectedServiceCategory === 'carpet' && '🧺 Carpet/Rug Wash Sales History'}
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-100 mt-1">
                      {selectedEmployee !== 'all' ? `Employee: ${selectedEmployee}` : 'All Employees'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSalesHistory(false);
                      setEditingSale(null);
                      setEditForm({});
                    }}
                    className="text-white hover:text-gray-200 text-2xl sm:text-3xl font-bold flex-shrink-0"
                  >
                    ×
                  </button>
                </div>

                {/* Date/Period Filter Controls */}
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 mt-3 sm:mt-4">
                  {/* Period Selector */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-purple-100 mb-2">View Period</label>
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                      <button
                        onClick={() => setHistoryFilterPeriod('day')}
                        className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-base font-semibold transition-colors ${
                          historyFilterPeriod === 'day'
                            ? 'bg-white text-purple-600'
                            : 'bg-purple-500 text-white hover:bg-purple-400'
                        }`}
                      >
                        Day
                      </button>
                      <button
                        onClick={() => setHistoryFilterPeriod('week')}
                        className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-base font-semibold transition-colors ${
                          historyFilterPeriod === 'week'
                            ? 'bg-white text-purple-600'
                            : 'bg-purple-500 text-white hover:bg-purple-400'
                        }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setHistoryFilterPeriod('month')}
                        className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-base font-semibold transition-colors ${
                          historyFilterPeriod === 'month'
                            ? 'bg-white text-purple-600'
                            : 'bg-purple-500 text-white hover:bg-purple-400'
                        }`}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setHistoryFilterPeriod('year')}
                        className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-base font-semibold transition-colors ${
                          historyFilterPeriod === 'year'
                            ? 'bg-white text-purple-600'
                            : 'bg-purple-500 text-white hover:bg-purple-400'
                        }`}
                      >
                        Year
                      </button>
                    </div>
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-purple-100 mb-2">
                      Select {historyFilterPeriod === 'day' ? 'Date' : historyFilterPeriod === 'week' ? 'Week (any day)' : historyFilterPeriod === 'month' ? 'Month (any day)' : 'Year (any day)'}
                    </label>
                    <input
                      type="date"
                      value={historyFilterDate}
                      onChange={(e) => setHistoryFilterDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                </div>

                {/* Display selected date range */}
                <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-purple-100">
                  {(() => {
                    const { startDate, endDate } = getDateRangeForPeriod(historyFilterPeriod, historyFilterDate);
                    if (startDate === endDate) {
                      return `📅 Showing: ${startDate}`;
                    } else {
                      return `📅 Showing: ${startDate} to ${endDate}`;
                    }
                  })()}
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {getServiceSales().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl sm:text-6xl mb-4">📊</div>
                    <p className="text-base sm:text-lg">No sales records found</p>
                    <p className="text-xs sm:text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {getGroupedSalesByEmployee().map(([employeeName, employeeSales]) => (
                      <div key={employeeName} className="space-y-2 sm:space-y-3">
                        {/* Employee Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-md z-10">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <span className="text-xl sm:text-2xl flex-shrink-0">👨‍🔧</span>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm sm:text-lg truncate">{employeeName}</h3>
                                <p className="text-xs sm:text-sm text-indigo-100">
                                  {employeeSales.length} {employeeSales.length === 1 ? 'sale' : 'sales'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-indigo-200 hidden sm:block">Total Revenue</div>
                              <div className="text-sm sm:text-xl font-bold">
                                KSh {employeeSales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Employee's Sales */}
                        {employeeSales.map((sale) => (
                          <div key={sale.id} className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 hover:border-purple-300 transition-colors ml-2 sm:ml-4">
                        {editingSale === sale.id ? (
                          /* Edit Mode */
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Service Type */}
                              {selectedServiceCategory === 'vehicle' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Service Type</label>
                                  <input
                                    type="text"
                                    value={editForm.vehicleServiceType}
                                    onChange={(e) => setEditForm({ ...editForm, vehicleServiceType: e.target.value })}
                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                              )}
                              {selectedServiceCategory === 'motorbike' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Service Type</label>
                                  <input
                                    type="text"
                                    value={editForm.motorbikeServiceType}
                                    onChange={(e) => setEditForm({ ...editForm, motorbikeServiceType: e.target.value })}
                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                              )}
                              {selectedServiceCategory === 'carpet' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Service Type</label>
                                  <input
                                    type="text"
                                    value={editForm.carpetServiceType}
                                    onChange={(e) => setEditForm({ ...editForm, carpetServiceType: e.target.value })}
                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                              )}

                              {/* Amount */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Amount (KSh)</label>
                                <input
                                  type="number"
                                  value={editForm.amount}
                                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                />
                              </div>

                              {/* Payment Method */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                  value={editForm.paymentMethod}
                                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                >
                                  <option value="Cash">Cash</option>
                                  <option value="M-Pesa">M-Pesa</option>
                                  <option value="Card">Card</option>
                                  <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                              </div>

                              {/* Additional fields based on category */}
                              {selectedServiceCategory === 'vehicle' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Model</label>
                                  <input
                                    type="text"
                                    value={editForm.vehicleModel}
                                    onChange={(e) => setEditForm({ ...editForm, vehicleModel: e.target.value })}
                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                              )}
                              {selectedServiceCategory === 'motorbike' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Number of Motorbikes</label>
                                  <input
                                    type="number"
                                    value={editForm.numberOfMotorbikes}
                                    onChange={(e) => setEditForm({ ...editForm, numberOfMotorbikes: e.target.value })}
                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                              )}
                              {selectedServiceCategory === 'carpet' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                                  <input
                                    type="text"
                                    value={editForm.size}
                                    onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={cancelEditSale}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEditedSale(sale.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                              >
                                💾 Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="space-y-3">
                            {/* Sale Info Section */}
                            <div className="flex items-start gap-2 sm:gap-3">
                              <span className="text-xl sm:text-2xl flex-shrink-0">
                                {selectedServiceCategory === 'vehicle' && '🚗'}
                                {selectedServiceCategory === 'motorbike' && '🏍️'}
                                {selectedServiceCategory === 'carpet' && '🧺'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 text-sm sm:text-lg flex flex-wrap items-center gap-2">
                                  <span className="break-words">
                                    {selectedServiceCategory === 'vehicle' && sale.vehicleServiceType}
                                    {selectedServiceCategory === 'motorbike' && sale.motorbikeServiceType}
                                    {selectedServiceCategory === 'carpet' && sale.carpetServiceType}
                                  </span>
                                  {/* Return status badge for carpets */}
                                  {selectedServiceCategory === 'carpet' && (
                                    sale.returned ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                        ✅ Returned
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full animate-pulse whitespace-nowrap">
                                        🕐 At Car Wash
                                      </span>
                                    )
                                  )}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                  {selectedServiceCategory === 'vehicle' && sale.vehicleModel && `Model: ${sale.vehicleModel}`}
                                  {selectedServiceCategory === 'motorbike' && sale.numberOfMotorbikes && `Qty: ${sale.numberOfMotorbikes}`}
                                  {selectedServiceCategory === 'carpet' && sale.size && `Size: ${sale.size}`}
                                </div>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                              <div className="truncate">👤 {sale.employee}</div>
                              <div className="truncate">💳 {sale.paymentMethod}</div>
                              <div>📅 {sale.date}</div>
                              <div>🕐 {formatTimeOnly(sale.timestamp)}</div>
                            </div>

                            {/* Amount Display */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                              <div className="text-xs sm:text-sm text-green-700 font-medium">Total Revenue</div>
                              <div className="text-xl sm:text-2xl font-bold text-green-600">
                                KSh {parseFloat(sale.amount).toLocaleString()}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => startEditSale(sale)}
                                className="flex-1 min-w-[100px] px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-purple-700 transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              {/* Mark as Returned button - only for carpets */}
                              {selectedServiceCategory === 'carpet' && !sale.returned && (
                                <button
                                  onClick={() => markCarpetAsReturned(sale.id)}
                                  className="flex-1 min-w-[140px] px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors"
                                >
                                  ✅ Mark as Returned
                                </button>
                              )}
                              <button
                                onClick={() => deleteSale(sale.id)}
                                className="flex-1 min-w-[100px] px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total Records: <span className="font-semibold">{getServiceSales().length}</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    Total Revenue: KSh {getServiceSales().reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

