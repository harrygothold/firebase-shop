import { useAsyncCall } from './useAsyncCall';
import { ShipmentStatus } from '../types';
import { firebase } from '../firebase/config';
import { ordersRef } from '../firebase';

export const useUpdateShipmentStatus = () => {
  const { loading, setLoading, error, setError } = useAsyncCall();

  const updateStatus = async (orderId: string, newStatus: ShipmentStatus) => {
    try {
      setLoading(true);
      await ordersRef
        .doc(orderId)
        .set(
          {
            shipmentStatus: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      return true;
    } catch (error) {
      const { message } = error as { message: string };
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error };
};
