import { useAsyncCall } from './useAsyncCall';
import { functions, firebase, db } from '../firebase/config';
import { cartRef, ordersRef } from '../firebase';
import {
  CartItem,
  CreatePaymentIntentsData,
  PaymentMethod,
  UploadOrder,
} from '../types';
import { Stripe } from '@stripe/stripe-js';
import { address_key } from '../components/SelectAddress/ShippingAddress';

export const useCheckout = () => {
  const { loading, setLoading, error, setError } = useAsyncCall();

  const completePayment = async (
    paymentData: {
      createPaymentIntentData: CreatePaymentIntentsData;
      stripe: Stripe;
      payment_method: PaymentMethod;
    },
    options: {
      save: boolean | undefined;
      setDefault: boolean | undefined;
      customerId?: string;
    },
    order: UploadOrder,
    cart: CartItem[]
  ) => {
    const { save, setDefault, customerId } = options;
    const { createPaymentIntentData, stripe, payment_method } = paymentData;
    try {
      setLoading(true);
      // call cloud function - get client secret
      const createPatmentIntents = functions.httpsCallable(
        'createPaymentIntents'
      );
      const paymentIntent = (await createPatmentIntents(
        createPaymentIntentData
      )) as { data: { clientSecret: string } };
      if (!paymentIntent.data.clientSecret) return;

      // confirm payment
      const confirmPayment = await stripe.confirmCardPayment(
        paymentIntent.data.clientSecret,
        {
          payment_method,
          save_payment_method: save,
        }
      );
      if (confirmPayment.error?.message) {
        setError(confirmPayment.error.message);
        setLoading(false);
        return false;
      }

      if (confirmPayment.paymentIntent?.status === 'succeeded') {
        if (setDefault) {
          const setDefaultCard = functions.httpsCallable('setDefaultCard');
          await setDefaultCard({
            customerId,
            payment_method: confirmPayment.paymentIntent.payment_method,
          });
        }

        // create new order in firestore
        const uploadOrder: UploadOrder = {
          ...order,
          paymentStatus: 'Success',
          shipmentStatus: 'New',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        await ordersRef.add(uploadOrder).then(() => {
          // Delete cart items from firestore
          cartRef
            .where('user', '==', order.user.id)
            .get()
            .then((snapshots) => {
              const batch = db.batch();
              snapshots.forEach((doc) =>
                cart.forEach((item) =>
                  item.id === doc.id ? batch.delete(doc.ref) : null
                )
              );
              return batch.commit();
            });
        });
        window.localStorage.removeItem(address_key);
        setLoading(false);
        return true;
      }

      return false;
    } catch (err) {
      setError('Sorry, something went wrong');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createStripeCustomerId = async () => {
    try {
      setLoading(true);
      const createStripeCustomer = functions.httpsCallable(
        'createStripeCustomer'
      );
      const stripeCustomerData = (await createStripeCustomer()) as {
        data: { customerId: string };
      };
      return stripeCustomerData.data.customerId;
    } catch (err) {
      setError('Sorry, something went wrong');
      return undefined;
    }
  };

  return { completePayment, createStripeCustomerId, loading, error };
};
