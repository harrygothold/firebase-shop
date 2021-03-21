import {
  Role,
  ProductCategory,
  CartItem,
  PurchasedItem,
  ShipmentStatus,
  ProductTab,
  OrderTab,
} from '../types';

export const isAdmin = (role: Role | null) =>
  role === 'ADMIN' || role === 'SUPER_ADMIN';

export const isClient = (role: Role | null): role is 'CLIENT' =>
  role === 'CLIENT';

export const categories: ProductCategory[] = [
  'Accessories',
  'Clothing',
  'Shoes',
  'Watches',
];

export const shipmentStatuses: ShipmentStatus[] = [
  'New',
  'Preparing',
  'Shipped',
  'Delivered',
  'Canceled',
];

export const productTabs: ProductTab[] = [
  'All',
  'Accessories',
  'Clothing',
  'Shoes',
  'Watches',
];

export const orderTabs: OrderTab[] = [
  'New',
  'Preparing',
  'Shipped',
  'Delivered',
  'Canceled',
  'All',
];

export const formatAmount = (amount: number) =>
  amount.toLocaleString('en', {
    minimumFractionDigits: 2,
  });

export const calculateCartQuantity = (cart: (CartItem | PurchasedItem)[]) =>
  cart.reduce((qty, item) => qty + item.quantity, 0);

export const calculateCartAmount = (cart: (CartItem | PurchasedItem)[]) =>
  cart.reduce(
    (amount, cartItem) => amount + cartItem.quantity * cartItem.item.price,
    0
  );

export const shippingStatusColour = (
  shipmentStatus: ShipmentStatus | undefined
): string | undefined => {
  return shipmentStatus === 'New'
    ? 'blue'
    : shipmentStatus === 'Preparing'
    ? 'chocolate'
    : shipmentStatus === 'Shipped'
    ? 'green'
    : shipmentStatus === 'Delivered'
    ? 'grey'
    : shipmentStatus === 'Canceled'
    ? 'red'
    : undefined;
};

export const calculateTotalPages = (totalItems: number, perPage: number) =>
  Math.ceil(totalItems / perPage);

export const getLastItem = <T>(array: T[]) => array[array.length - 1];

type Error = { message: string };

export const getError = (error: Error) => error.message;
