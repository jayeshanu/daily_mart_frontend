export interface Item {
  id: number;
  name: string;
  category: string;
  buy_price: number;
  sell_price: number;
  weight: number;
  expiry_date: string;
  quantity: number;
  location: string;
  description: string;
}

export interface MoveItemRequest {
  to_location: string;
  quantity: number;
} 