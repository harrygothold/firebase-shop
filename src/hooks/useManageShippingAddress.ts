import { Address, UserInfo } from '../types';
import { firebase } from '../firebase/config';
import { useAsyncCall } from './useAsyncCall';
import { usersRef } from '../firebase';

export const useManageShippingAddress = () => {
  const { loading, setLoading, error, setError } = useAsyncCall();

  const addNewAddress = async (
    data: Omit<Address, 'index'>,
    userInfo: UserInfo
  ) => {
    try {
      setLoading(true);
      const updatedUserInfo = {
        shippingAddresses: userInfo.shippingAddresses
          ? [...userInfo.shippingAddresses, data]
          : [data],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      // update the user doc in users collection
      await usersRef.doc(userInfo.id).set(updatedUserInfo, { merge: true });
      return true;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editAddress = async (
    data: Omit<Address, 'index'>,
    index: number,
    userInfo: UserInfo
  ) => {
    try {
      if (!userInfo.shippingAddresses) {
        setError('Sorry, cannot edit the shipping address');
        return false;
      }
      setLoading(true);
      const currentShippingAddresses = userInfo.shippingAddresses;
      currentShippingAddresses[index] = data;
      const updatedUserInfo = {
        shippingAddresses: currentShippingAddresses,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await usersRef.doc(userInfo.id).set(updatedUserInfo, { merge: true });
      return true;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (index: number, userInfo: UserInfo) => {
    try {
      if (
        !userInfo.shippingAddresses ||
        userInfo.shippingAddresses.length === 0
      ) {
        setError('Sorry, something went wrong');
        return false;
      }
      setLoading(true);
      const updatedUserInfo = {
        shippingAddresses: userInfo.shippingAddresses.filter(
          (_, i) => i !== index
        ),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await usersRef.doc(userInfo.id).set(updatedUserInfo, { merge: true });
      return true;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addNewAddress, editAddress, deleteAddress, error, loading };
};
