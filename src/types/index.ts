import {
  CreatePaymentMethodCardData,
  PaymentMethod as IPaymentMethod,
} from '@stripe/stripe-js';
import { firebase } from '../firebase/config';

export type SignUpData = {
  username: string;
  email: string;
  password: string;
};

export type AuthUser = firebase.User;

export type SocialProvider = 'facebook' | 'google';

export type Role = 'SUPER_ADMIN' | 'CLIENT' | 'ADMIN';

export type Address = {
  index?: number;
  fullname: string;
  address1: string;
  address2?: string;
  city: string;
  zipCode: string;
  phone: string;
};

export type UserInfo = {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: firebase.firestore.Timestamp;
  shippingAddresses?: Address[];
  stripeCustomerId?: string;
  updatedAt?: firebase.firestore.Timestamp;
};

export type ProductTab = 'All' | ProductCategory;
export type ProductCategory = 'Clothing' | 'Shoes' | 'Watches' | 'Accessories';

export type Product = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageRef: string;
  imageFileName: string;
  price: number;
  category: ProductCategory;
  inventory: number;
  creator: string;
  createdAt: firebase.firestore.Timestamp;
  updatedAt?: firebase.firestore.Timestamp;
};

export type AddProductData = Pick<
  Product,
  'title' | 'description' | 'imageFileName' | 'price' | 'category' | 'inventory'
>;

// Product type for uploading document
export type UploadProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.FieldValue;
};

export type CartItem = {
  id: string;
  product: string;
  quantity: number;
  user: string;
  item: Product;
  createdAt: firebase.firestore.Timestamp;
  updatedAt?: firebase.firestore.Timestamp;
};

export type PaymentStatus = 'Success' | 'Refund';

export type OrderTab = 'All' | ShipmentStatus;

export type ShipmentStatus =
  | 'New'
  | 'Preparing'
  | 'Shipped'
  | 'Delivered'
  | 'Canceled';

export type PurchasedItem = Pick<CartItem, 'quantity' | 'user' | 'item'>;

export type Order = {
  id: string;
  items: PurchasedItem[];
  amount: number;
  totalQuantity: number;
  shippingAddress: Address;
  user: { id: string; name: string };
  paymentStatus?: PaymentStatus;
  shipmentStatus?: ShipmentStatus;
  createdAt: firebase.firestore.Timestamp;
  updatedAt?: firebase.firestore.Timestamp;
};

// Order type used to upload a document in firestore
export type UploadOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.FieldValue;
};

export type UploadCartItem = Omit<
  CartItem,
  'id' | 'createdAt' | 'updatedAt' | 'item'
> & {
  createdAt: firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.FieldValue;
};

export type CreatePaymentIntentsData = {
  amount: number;
  customer?: string;
  payment_method?: string;
};

export type PaymentMethod =
  | string
  | Pick<
      CreatePaymentMethodCardData,
      'card' | 'billing_details' | 'metadata' | 'payment_method'
    >;

export type UserCards = { data: IPaymentMethod[] };

export type StripeCustomer = {
  id: string;
  invoice_settings: { default_payment_method: string };
};

export type SearchedProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
};

export type SearchedOrder = Omit<Order, 'createdAt' | 'updatedAt'> & {
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
};

export type SearchUser = Omit<UserInfo, 'createdAt' | 'updatedAt'> & {
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
};
