import axios from 'axios';
import { Item, MoveItemRequest } from '../types/Item';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ItemService = {
  createItem: async (item: Item) => {
    const response = await api.post('/items', item);
    return response.data;
  },

  createBulkItems: async (items: Item[]) => {
    const response = await api.post('/items/bulk', items);
    return response.data;
  },

  listItems: async (filters?: {
    category?: string;
    location?: string;
    expiry_before?: string;
  }) => {
    const response = await api.get('/items', { params: filters });
    return response.data;
  },

  moveItem: async (itemId: number, moveRequest: MoveItemRequest) => {
    console.log(`Moving item ${itemId} to ${moveRequest.to_location} with quantity ${moveRequest.quantity}`);
    try {
      const response = await api.put(`/items/${itemId}/move`, moveRequest);
      console.log('Move response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in moveItem API call:', error);
      throw error;
    }
  },

  deleteItem: async (itemId: number) => {
    console.log(`Deleting item with ID: ${itemId}`);
    try {
      const response = await api.delete(`/items/${itemId}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in deleteItem API call:', error);
      throw error;
    }
  },

  sellItem: async (itemId: number, sellRequest: { 
    quantity: number; 
    price: number;
    buy_price: number;
    discount?: number;
    discount_type?: 'percentage' | 'amount';
    transaction_date?: string;
  }) => {
    try {
      const response = await api.post(`/items/${itemId}/sell`, sellRequest);
      return response.data;
    } catch (error) {
      console.error('Error in sellItem API call:', error);
      throw error;
    }
  },

  updateItem: async (itemId: number, updates: { category?: string; description?: string; expiry_date?: string; quantity?: number }) => {
    try {
      console.log('Making API call to update item:', itemId);
      console.log('Update payload:', updates);
      const response = await api.put(`/items/${itemId}`, updates);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updateItem API call:', error);
      throw error;
    }
  },
};

export const MovementService = {
  getMovements: async () => {
    try {
      const response = await api.get('/api/movements');
      return response.data;
    } catch (error) {
      console.error('Error in getMovements API call:', error);
      throw error;
    }
  },
};

export interface Transaction {
  id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  buying_price: number;
  selling_price: number;
  discount: number;
  transaction_date: string;
}

export interface TransactionCreate {
  item_id: number;
  quantity: number;
  selling_price: number;
  buying_price: number;
  discount?: number;
  transaction_type: string;
  description?: string;
}

export const TransactionService = {
  createTransaction: async (transaction: TransactionCreate): Promise<Transaction> => {
    const response = await api.post('/transactions/', transaction);
    return response.data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    console.log('Fetching transactions from:', `${API_BASE_URL}/api/transactions`);
    try {
      const response = await axios.get<Transaction[]>(`${API_BASE_URL}/api/transactions`);
      console.log('Transactions API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  getTransaction: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  getTransactionsByItem: async (itemId: number): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/item/${itemId}`);
    return response.data;
  },
};

export const getTransactions = async (): Promise<Transaction[]> => {
  console.log('Fetching transactions from:', `${API_BASE_URL}/api/transactions`);
  try {
    const response = await axios.get<Transaction[]>(`${API_BASE_URL}/api/transactions`);
    console.log('Transactions API response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export default api; 