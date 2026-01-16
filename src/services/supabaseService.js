import { supabase, isSupabaseConfigured } from '../config/supabase';

/**
 * Supabase Service Layer
 * Provides CRUD operations for all data entities with localStorage fallback
 */

// ==================== SALES ====================

export const salesService = {
  // Get all sales
  async getAll() {
    if (!isSupabaseConfigured()) {
      return JSON.parse(localStorage.getItem('dailySales') || '[]');
    }

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      return JSON.parse(localStorage.getItem('dailySales') || '[]');
    }

    return data;
  },

  // Get sales by date
  async getByDate(date) {
    if (!isSupabaseConfigured()) {
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]');
      return sales.filter(s => s.date === date);
    }

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales by date:', error);
      return [];
    }

    return data;
  },

  // Get sales by employee
  async getByEmployee(employeeName) {
    if (!isSupabaseConfigured()) {
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]');
      return sales.filter(s => s.employee === employeeName);
    }

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('employee', employeeName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales by employee:', error);
      return [];
    }

    return data;
  },

  // Create new sale
  async create(saleData) {
    if (!isSupabaseConfigured()) {
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]');
      const newSale = { ...saleData, id: Date.now().toString() };
      sales.unshift(newSale);
      localStorage.setItem('dailySales', JSON.stringify(sales));
      return newSale;
    }

    const { data, error } = await supabase
      .from('sales')
      .insert([saleData])
      .select()
      .single();

    if (error) {
      console.error('Error creating sale:', error);
      throw error;
    }

    return data;
  },

  // Delete sale
  async delete(id) {
    if (!isSupabaseConfigured()) {
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]');
      const filtered = sales.filter(s => s.id !== id);
      localStorage.setItem('dailySales', JSON.stringify(filtered));
      return true;
    }

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }

    return true;
  }
};

// ==================== EMPLOYEES ====================

export const employeesService = {
  // Get all employees
  async getAll() {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      return adminData.employees || [];
    }

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }

    return data;
  },

  // Create new employee
  async create(employeeData) {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const employees = adminData.employees || [];
      const newEmployee = { ...employeeData, id: Date.now().toString() };
      employees.unshift(newEmployee);
      adminData.employees = employees;
      localStorage.setItem('adminData', JSON.stringify(adminData));
      return newEmployee;
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      throw error;
    }

    return data;
  },

  // Delete employee
  async delete(id) {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      adminData.employees = (adminData.employees || []).filter(e => e.id !== id);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      return true;
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }

    return true;
  },

  // Upload employee photo
  async uploadPhoto(file, employeeId) {
    if (!isSupabaseConfigured()) {
      // Convert to base64 for localStorage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('employee-photos')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('employee-photos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }
};

// ==================== EXPENSES ====================

export const expensesService = {
  // Get all expenses
  async getAll() {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      return adminData.expenses || [];
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }

    return data;
  },

  // Create new expense
  async create(expenseData) {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const expenses = adminData.expenses || [];
      const newExpense = { ...expenseData, id: Date.now().toString() };
      expenses.unshift(newExpense);
      adminData.expenses = expenses;
      localStorage.setItem('adminData', JSON.stringify(adminData));
      return newExpense;
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }

    return data;
  },

  // Delete expense
  async delete(id) {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      adminData.expenses = (adminData.expenses || []).filter(e => e.id !== id);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      return true;
    }

    const { error} = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }

    return true;
  }
};

// ==================== NOTES ====================

export const notesService = {
  // Get all notes
  async getAll() {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      return adminData.notes || [];
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }

    return data;
  },

  // Create new note
  async create(noteData) {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const notes = adminData.notes || [];
      const newNote = { ...noteData, id: Date.now().toString() };
      notes.unshift(newNote);
      adminData.notes = notes;
      localStorage.setItem('adminData', JSON.stringify(adminData));
      return newNote;
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return data;
  },

  // Delete note
  async delete(id) {
    if (!isSupabaseConfigured()) {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      adminData.notes = (adminData.notes || []).filter(n => n.id !== id);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      return true;
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }

    return true;
  }
};

// ==================== LEADS ====================

export const leadsService = {
  // Get all leads
  async getAll() {
    if (!isSupabaseConfigured()) {
      return JSON.parse(localStorage.getItem('leadRecords') || '[]');
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return data;
  },

  // Create new lead
  async create(leadData) {
    if (!isSupabaseConfigured()) {
      const leads = JSON.parse(localStorage.getItem('leadRecords') || '[]');
      const newLead = { ...leadData, id: Date.now().toString() };
      leads.unshift(newLead);
      localStorage.setItem('leadRecords', JSON.stringify(leads));
      return newLead;
    }

    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    return data;
  },

  // Delete lead
  async delete(id) {
    if (!isSupabaseConfigured()) {
      const leads = JSON.parse(localStorage.getItem('leadRecords') || '[]');
      const filtered = leads.filter(l => l.id !== id);
      localStorage.setItem('leadRecords', JSON.stringify(filtered));
      return true;
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }

    return true;
  }
};
