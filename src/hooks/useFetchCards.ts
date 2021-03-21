import { useState, useEffect } from 'react';
import { functions } from '../firebase/config';
import { StripeCustomer, UserCards, UserInfo } from '../types';
import { useAsyncCall } from './useAsyncCall';

export const useFetchCards = (userInfo: UserInfo | null) => {
  const { loading, setLoading, error, setError } = useAsyncCall();
  const [userCards, setUserCards] = useState<UserCards | null>(null);
  const [stripeCustomer, setStripeCustomer] = useState<StripeCustomer | null>(
    null
  );

  useEffect(() => {
    if (!userInfo?.stripeCustomerId) return;
    let mounted = true;
    const fetchCards = async (customerId: string) => {
      try {
        setLoading(true);
        const listPaymentMethods = functions.httpsCallable(
          'listPaymentMethods'
        );
        const customerData = (await listPaymentMethods({ customerId })) as {
          data: { paymentMethods: UserCards; customer: StripeCustomer };
        };

        if (mounted) {
          setUserCards(customerData.data.paymentMethods);
          setStripeCustomer(customerData.data.customer);
        }
      } catch (err) {
        if (mounted) {
          setError('Sorry, something went wrong');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchCards(userInfo.stripeCustomerId);
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, [setUserCards, setStripeCustomer, setLoading, setError]);

  return { loading, error, userCards, stripeCustomer, setUserCards };
};
