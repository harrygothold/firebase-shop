import { useAsyncCall } from './useAsyncCall';
import { cartRef } from '../firebase';
import { firebase } from '../firebase/config';
import { UploadCartItem } from '../types';

export const useManageCart = () => {
  const { loading, setLoading, error, setError } = useAsyncCall();

  const addToCart = async (
    productId: string,
    quantity: number,
    userId: string,
    inventory: number
  ) => {
    try {
      setLoading(true);
      // query cart from firestore
      const cartItemRef = cartRef.doc(`${userId}-${productId}`);
      const snapshot = await cartItemRef.get();

      let cartItem: UploadCartItem;

      if (!snapshot.exists) {
        // create new cart
        cartItem = {
          product: productId,
          quantity,
          user: userId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
      } else {
        // update carts quantity
        const currentCartItem = snapshot.data() as UploadCartItem;
        cartItem = {
          ...currentCartItem,
          quantity:
            currentCartItem.quantity + quantity > inventory
              ? inventory
              : currentCartItem.quantity + quantity,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
      }
      await cartItemRef.set(cartItem);
      return true;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (productId: string, userId: string) => {
    try {
      setLoading(true);
      const cartItemRef = cartRef.doc(`${userId}-${productId}`);
      const snapshot = await cartItemRef.get();
      if (!snapshot.exists) return;
      await cartItemRef.delete();
      return true;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, removeCartItem, loading, error };
};
