import { supabase, isSupabaseConfigured } from '../config/supabase';

/**
 * Supabase Service Layer
 * Provides CRUD operations for all data entities with localStorage fallback
 */

// ==================== SALES ====================

// Helper function to transform sales data from snake_case (DB) to camelCase (React)
const transformSaleFromDB = (sale) => {
  if (!sale) return sale;

  return {
    ...sale,
    // Map snake_case DB fields to camelCase React properties
    vehicleModel: sale.vehicle_model,
    vehicleServiceType: sale.vehicle_service_type,
    motorbikeServiceType: sale.motorbike_service_type,
    numberOfMotorbikes: sale.number_of_motorbikes,
    carpetServiceType: sale.carpet_service_type,
    paymentMethod: sale.payment_method,
    serviceType: sale.service_type,
    createdAt: sale.created_at
  };
};

export const salesService = {
  // Get all sales
  async getAll() {
    console.log('🔍 salesService.getAll: Checking Supabase configuration...');
    console.log('  - isSupabaseConfigured():', isSupabaseConfigured());
    console.log('  - supabase client exists:', !!supabase);

    if (!isSupabaseConfigured() || !supabase) {
      console.log('⚠️ salesService.getAll: Using localStorage fallback');
      return JSON.parse(localStorage.getItem('dailySales') || '[]');
    }

    try {
      console.log('📡 salesService.getAll: Fetching from Supabase...');
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ salesService.getAll: Error fetching sales:', error);
        return JSON.parse(localStorage.getItem('dailySales') || '[]');
      }

      console.log('✅ salesService.getAll: Fetched', data?.length || 0, 'sales');
      // Transform data from snake_case to camelCase
      const transformedData = data.map(transformSaleFromDB);
      console.log('🔄 salesService.getAll: Transformed data sample:', transformedData[0]);
      return transformedData;
    } catch (error) {
      console.error('❌ salesService.getAll: Exception:', error);
      return JSON.parse(localStorage.getItem('dailySales') || '[]');
    }
  },

  // Get sales by date
  async getByDate(date) {
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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
    console.log('🔍 salesService.create: Checking Supabase configuration...');
    console.log('  - isSupabaseConfigured():', isSupabaseConfigured());
    console.log('  - supabase client exists:', !!supabase);
    console.log('  - Sale data:', saleData);

    if (!isSupabaseConfigured() || !supabase) {
      console.log('⚠️ salesService.create: Using localStorage fallback');
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]');
      const newSale = { ...saleData, id: Date.now().toString() };
      sales.unshift(newSale);
      localStorage.setItem('dailySales', JSON.stringify(sales));
      return newSale;
    }

    console.log('📡 salesService.create: Inserting into Supabase...');
    const { data, error } = await supabase
      .from('sales')
      .insert([saleData])
      .select()
      .single();

    if (error) {
      console.error('❌ salesService.create: Error creating sale:', error);
      throw error;
    }

    console.log('✅ salesService.create: Sale created successfully!', data);
    // Transform the returned data from snake_case to camelCase
    return transformSaleFromDB(data);
  },

  // Update sale
  async update(id, updateData) {
    console.log('🔍 salesService.update: Updating sale...', id, updateData);

    if (!isSupabaseConfigured() || !supabase) {
      console.log('⚠️ salesService.update: Using localStorage fallback');
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]');
      const updatedSales = sales.map(sale =>
        sale.id === id ? { ...sale, ...updateData } : sale
      );
      localStorage.setItem('dailySales', JSON.stringify(updatedSales));
      return updatedSales.find(s => s.id === id);
    }

    console.log('📡 salesService.update: Updating in Supabase...');
    const { data, error } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ salesService.update: Error updating sale:', error);
      throw error;
    }

    console.log('✅ salesService.update: Sale updated successfully!', data);
    // Transform the returned data from snake_case to camelCase
    return transformSaleFromDB(data);
  },

  // Mark carpet as returned
  async markAsReturned(id) {
    console.log('🔍 salesService.markAsReturned: Marking carpet as returned...', id);

    if (!isSupabaseConfigured() || !supabase) {
      console.log('⚠️ salesService.markAsReturned: Using localStorage fallback');
      const sales = JSON.parse(localStorage.getItem('dailySales') || '[]');
      const updatedSales = sales.map(sale =>
        sale.id === id ? {
          ...sale,
          returned: true,
          returnedDate: new Date().toISOString()
        } : sale
      );
      localStorage.setItem('dailySales', JSON.stringify(updatedSales));
      return updatedSales.find(s => s.id === id);
    }

    console.log('📡 salesService.markAsReturned: Updating in Supabase...');
    const { data, error } = await supabase
      .from('sales')
      .update({
        returned: true,
        returned_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ salesService.markAsReturned: Error marking as returned:', error);
      throw error;
    }

    console.log('✅ salesService.markAsReturned: Carpet marked as returned!', data);
    return data;
  },

  // Delete sale
  async delete(id) {
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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

  // Update employee
  async update(id, updateData) {
    console.log('🔍 employeesService.update: Updating employee...', id, updateData);

    if (!isSupabaseConfigured() || !supabase) {
      console.log('⚠️ employeesService.update: Using localStorage fallback');
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const employees = adminData.employees || [];
      const updatedEmployees = employees.map(emp =>
        emp.id === id ? { ...emp, ...updateData } : emp
      );
      adminData.employees = updatedEmployees;
      localStorage.setItem('adminData', JSON.stringify(adminData));
      return updatedEmployees.find(e => e.id === id);
    }

    console.log('📡 employeesService.update: Updating in Supabase...');
    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ employeesService.update: Error updating employee:', error);
      throw error;
    }

    console.log('✅ employeesService.update: Employee updated successfully!', data);
    return data;
  },

  // Delete employee
  async delete(id) {
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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

  // Update expense
  async update(id, updateData) {
    console.log('🔍 expensesService.update: Updating expense...', id, updateData);

    if (!isSupabaseConfigured() || !supabase) {
      console.log('⚠️ expensesService.update: Using localStorage fallback');
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const expenses = adminData.expenses || [];
      const updatedExpenses = expenses.map(exp =>
        exp.id === id ? { ...exp, ...updateData } : exp
      );
      adminData.expenses = updatedExpenses;
      localStorage.setItem('adminData', JSON.stringify(adminData));
      return updatedExpenses.find(e => e.id === id);
    }

    console.log('📡 expensesService.update: Updating in Supabase...');
    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ expensesService.update: Error updating expense:', error);
      throw error;
    }

    console.log('✅ expensesService.update: Expense updated successfully!', data);
    return data;
  },

  // Delete expense
  async delete(id) {
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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
    if (!isSupabaseConfigured() || !supabase) {
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

  // Update lead
  async update(id, updateData) {
    console.log('🔍 leadsService.update: Updating lead...', id, updateData);

    if (!isSupabaseConfigured() || !supabase) {
      console.log('⚠️ leadsService.update: Using localStorage fallback');
      const leads = JSON.parse(localStorage.getItem('leadRecords') || '[]');
      const updatedLeads = leads.map(lead =>
        lead.id === id ? { ...lead, ...updateData } : lead
      );
      localStorage.setItem('leadRecords', JSON.stringify(updatedLeads));
      return updatedLeads.find(l => l.id === id);
    }

    console.log('📡 leadsService.update: Updating in Supabase...');
    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ leadsService.update: Error updating lead:', error);
      throw error;
    }

    console.log('✅ leadsService.update: Lead updated successfully!', data);
    return data;
  },

  // Delete lead
  async delete(id) {
    if (!isSupabaseConfigured() || !supabase) {
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
