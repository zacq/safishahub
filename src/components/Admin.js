import { useState, useEffect } from "react";

export default function Admin({ onNavigate }) {
  const [adminData, setAdminData] = useState({
    vehicleSalesCount: "",
    vehicleSalesAmount: "",
    carpetSalesCount: "",
    carpetSalesAmount: "",
    expenses: [],
    leads: [],
    notes: []
  });

  const [expenseForm, setExpenseForm] = useState({ name: "", amount: "" });
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "" });
  const [noteForm, setNoteForm] = useState({ category: "Incident", content: "" });

  // Load admin data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("adminData");
    if (saved) {
      setAdminData(JSON.parse(saved));
    }
  }, []);

  // Save admin data to localStorage
  useEffect(() => {
    localStorage.setItem("adminData", JSON.stringify(adminData));
  }, [adminData]);

  // Handle sales input changes
  const handleSalesChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  // Add expense
  const addExpense = (e) => {
    e.preventDefault();
    if (expenseForm.name && expenseForm.amount) {
      const newExpense = {
        id: Date.now().toString(),
        name: expenseForm.name,
        amount: expenseForm.amount,
        date: new Date().toLocaleDateString()
      };
      setAdminData({
        ...adminData,
        expenses: [newExpense, ...adminData.expenses]
      });
      setExpenseForm({ name: "", amount: "" });
    }
  };

  // Delete expense
  const deleteExpense = (id) => {
    setAdminData({
      ...adminData,
      expenses: adminData.expenses.filter(exp => exp.id !== id)
    });
  };

  // Add lead
  const addLead = (e) => {
    e.preventDefault();
    if (leadForm.name && leadForm.phone) {
      const newLead = {
        id: Date.now().toString(),
        name: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email,
        date: new Date().toLocaleDateString()
      };
      setAdminData({
        ...adminData,
        leads: [newLead, ...adminData.leads]
      });
      setLeadForm({ name: "", phone: "", email: "" });
    }
  };

  // Delete lead
  const deleteLead = (id) => {
    setAdminData({
      ...adminData,
      leads: adminData.leads.filter(lead => lead.id !== id)
    });
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

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Sales Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            💰 Daily Sales Summary
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle Sales */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">🚗 Vehicle Sales</h3>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total Number</label>
                <input
                  type="number"
                  name="vehicleSalesCount"
                  value={adminData.vehicleSalesCount}
                  onChange={handleSalesChange}
                  placeholder="0"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total Amount (KSh)</label>
                <input
                  type="number"
                  name="vehicleSalesAmount"
                  value={adminData.vehicleSalesAmount}
                  onChange={handleSalesChange}
                  placeholder="0"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Carpet Sales */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">🧺 Carpet Sales</h3>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total Number</label>
                <input
                  type="number"
                  name="carpetSalesCount"
                  value={adminData.carpetSalesCount}
                  onChange={handleSalesChange}
                  placeholder="0"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total Amount (KSh)</label>
                <input
                  type="number"
                  name="carpetSalesAmount"
                  value={adminData.carpetSalesAmount}
                  onChange={handleSalesChange}
                  placeholder="0"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Items Sold</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(parseInt(adminData.vehicleSalesCount) || 0) + (parseInt(adminData.carpetSalesCount) || 0)}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold text-green-600">
                  KSh {((parseInt(adminData.vehicleSalesAmount) || 0) + (parseInt(adminData.carpetSalesAmount) || 0)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
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

        {/* High Value Leads Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🌟 High Value Leads
          </h2>

          <form onSubmit={addLead} className="mb-4">
            <div className="grid md:grid-cols-4 gap-3">
              <input
                type="text"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                placeholder="Name"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
              <input
                type="tel"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                placeholder="Phone"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
              <input
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                placeholder="Email (optional)"
                className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                + Add Lead
              </button>
            </div>
          </form>

          {adminData.leads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🌟</div>
              <p>No leads recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {adminData.leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{lead.name}</div>
                    <div className="text-sm text-gray-600">📱 {lead.phone}</div>
                    {lead.email && <div className="text-sm text-gray-600">📧 {lead.email}</div>}
                    <div className="text-xs text-gray-500 mt-1">{lead.date}</div>
                  </div>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="text-red-500 hover:text-red-700 text-xl"
                  >
                    ×
                  </button>
                </div>
              ))}
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

