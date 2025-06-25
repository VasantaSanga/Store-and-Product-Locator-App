export interface Product {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  products: StoreProductLink[]; // This is how Prisma returns it
  createdAt: string;
  updatedAt: string;
}

// Represents the StoreProduct join table record, including the nested Product
export interface StoreProductLink {
  id: string;
  storeId: string;
  productId: string;
  product: Product; // The actual product details
  createdAt: string;
  updatedAt: string;
}

// For filter state
export interface Filters {
  state: string | null;
  city: string | null;
  selectedProductIds: string[];
}
