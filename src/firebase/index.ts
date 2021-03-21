import { UserInfo, Product, CartItem, Order } from '../types';
import { db, firebase, storageRef } from './config';

import { v4 as uuidV4 } from 'uuid';

export const usersRef = db.collection('users');
export const userCountsRef = db.collection('user-counts');
export const productsRef = db.collection('products');
export const cartRef = db.collection('cart');
export const ordersRef = db.collection('orders');
export const productCountsRef = db.collection('product-counts');
export const productImagesFolder = 'products';
export const orderCountsRef = db.collection('order-counts');

export const snapshotToDoc = <T extends UserInfo | Product | CartItem | Order>(
  doc: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
) => {
  const docData = doc.data() as T;
  const docObject: T = {
    ...docData,
    id: doc.id,
  };
  return docObject;
};

export const createImageRef = (imageName: string) => {
  const uuid = uuidV4();
  return storageRef.child(`${productImagesFolder}/${imageName}-${uuid}`);
};
