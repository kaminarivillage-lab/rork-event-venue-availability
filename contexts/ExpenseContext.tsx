import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { VenueExpense, ExpenseCategory, CategoryItem } from '@/types/venue';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'electricity', label: 'Electricity', isDefault: true },
  { id: 'water', label: 'Water', isDefault: true },
  { id: 'gas', label: 'Gas', isDefault: true },
  { id: 'maintenance', label: 'Maintenance', isDefault: true },
  { id: 'supplies', label: 'Supplies', isDefault: true },
  { id: 'staff', label: 'Staff', isDefault: true },
  { id: 'cleaning', label: 'Cleaning', isDefault: true },
  { id: 'insurance', label: 'Insurance', isDefault: true },
  { id: 'taxes', label: 'Taxes', isDefault: true },
  { id: 'other', label: 'Other', isDefault: true },
];

const EXPENSES_STORAGE_KEY = '@venue_expenses';

export const [ExpenseProvider, useExpenses] = createContextHook(() => {
  const [expenses, setExpenses] = useState<Record<string, VenueExpense>>({});
  const [expenseCategories, setExpenseCategories] = useState<CategoryItem[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedExpenses, storedCategories] = await Promise.all([
          AsyncStorage.getItem(EXPENSES_STORAGE_KEY),
          AsyncStorage.getItem('expenseCategories')
        ]);
        
        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
          console.log('Loaded expenses from storage');
        }
        
        if (storedCategories) {
          setExpenseCategories(JSON.parse(storedCategories));
          console.log('Loaded expense categories from storage');
        }
      } catch (error) {
        console.error('Error loading expense data:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, isLoaded]);

  const saveExpenses = async () => {
    try {
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
      console.log('Saved expenses to storage:', Object.keys(expenses).length);
    } catch (error) {
      console.error('Failed to save expenses:', error);
    }
  };

  const saveCategories = useCallback(async (categories: CategoryItem[]) => {
    try {
      await AsyncStorage.setItem('expenseCategories', JSON.stringify(categories));
      console.log('Saved expense categories to storage');
    } catch (error) {
      console.error('Error saving expense categories:', error);
    }
  }, []);

  const addExpenseCategory = useCallback((label: string) => {
    const id = `custom-${Date.now()}`;
    const newCategory: CategoryItem = {
      id,
      label,
      isDefault: false,
    };
    const updated = [...expenseCategories, newCategory];
    setExpenseCategories(updated);
    saveCategories(updated);
    console.log('Added expense category:', newCategory);
    return id;
  }, [expenseCategories, saveCategories]);

  const updateExpenseCategory = useCallback((id: string, label: string) => {
    const updated = expenseCategories.map(cat => 
      cat.id === id ? { ...cat, label } : cat
    );
    setExpenseCategories(updated);
    saveCategories(updated);
    console.log('Updated expense category:', id);
  }, [expenseCategories, saveCategories]);

  const deleteExpenseCategory = useCallback((id: string) => {
    const category = expenseCategories.find(cat => cat.id === id);
    if (category?.isDefault) {
      console.error('Cannot delete default category');
      return false;
    }
    const updated = expenseCategories.filter(cat => cat.id !== id);
    setExpenseCategories(updated);
    saveCategories(updated);
    console.log('Deleted expense category:', id);
    return true;
  }, [expenseCategories, saveCategories]);

  const addExpense = useCallback((
    date: string,
    category: ExpenseCategory,
    amount: number,
    description: string
  ) => {
    const id = `expense-${Date.now()}`;
    const newExpense: VenueExpense = {
      id,
      date,
      category,
      amount,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setExpenses(prev => ({
      ...prev,
      [id]: newExpense,
    }));

    console.log('Expense added:', newExpense);
    return id;
  }, []);

  const updateExpense = useCallback((
    id: string,
    updates: Partial<Omit<VenueExpense, 'id' | 'createdAt'>>
  ) => {
    setExpenses(prev => {
      const existing = prev[id];
      if (!existing) {
        console.error('Expense not found:', id);
        return prev;
      }

      return {
        ...prev,
        [id]: {
          ...existing,
          ...updates,
          updatedAt: Date.now(),
        },
      };
    });

    console.log('Expense updated:', id);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });

    console.log('Expense deleted:', id);
  }, []);

  const getAllExpenses = useMemo(() => {
    return Object.values(expenses).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses]);

  const getExpensesSummary = useMemo(() => {
    let totalExpenses = 0;
    const byCategory: Record<ExpenseCategory, number> = {};

    expenseCategories.forEach(cat => {
      byCategory[cat.id] = 0;
    });

    Object.values(expenses).forEach(expense => {
      totalExpenses += expense.amount;
      if (byCategory[expense.category] !== undefined) {
        byCategory[expense.category] += expense.amount;
      } else {
        byCategory[expense.category] = expense.amount;
      }
    });

    return {
      totalExpenses,
      byCategory,
    };
  }, [expenses, expenseCategories]);

  const getExpensesByCategory = useCallback((category: ExpenseCategory) => {
    return Object.values(expenses).filter(expense => expense.category === category);
  }, [expenses]);

  const getExpensesByDateRange = useCallback((startDate: string, endDate: string) => {
    return Object.values(expenses).filter(expense => {
      const expenseDate = new Date(expense.date).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses]);

  return useMemo(() => ({
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getAllExpenses,
    getExpensesSummary,
    getExpensesByCategory,
    getExpensesByDateRange,
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    isLoaded,
  }), [
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getAllExpenses,
    getExpensesSummary,
    getExpensesByCategory,
    getExpensesByDateRange,
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    isLoaded,
  ]);
});
