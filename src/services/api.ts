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

  sellItem: async (itemId: number, sellRequest: { quantity: number; price: number }) => {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sellRequest),
    });
    if (!response.ok) {
      throw new Error('Failed to sell item');
    }
    return response.json();
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

export default api; 