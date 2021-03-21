import React, {
  FC,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from 'react';
import { useAuthContext } from './auth-context';
import { useAsyncCall } from '../hooks/useAsyncCall';
import { Order } from '../types';
import { firebase } from '../firebase/config';
import { isAdmin, isClient } from '../helpers';
import { ordersRef, snapshotToDoc } from '../firebase';

const ordersQueryLimit = 20;

interface Props {}

type NullishOrderArray = Order[] | null;

type OrdersState = {
  orders: NullishOrderArray;
  queryMoreOrders: () => void;
  loading: boolean;
  error: string;
};

type OrdersDispatch = {
  setOrders: Dispatch<SetStateAction<NullishOrderArray>>;
};

const OrdersStateContext = createContext<OrdersState | undefined>(undefined);
const OrdersDispatchContext = createContext<OrdersDispatch | undefined>(
  undefined
);

const OrdersContextProvider: FC<Props> = ({ children }) => {
  const [orders, setOrders] = useState<NullishOrderArray>(null);
  const [
    lastDocument,
    setLastDocument,
  ] = useState<firebase.firestore.DocumentData>();
  const { loading, setLoading, error, setError } = useAsyncCall();
  const {
    authState: { userInfo },
  } = useAuthContext();

  // Next Query
  const queryMoreOrders = async () => {
    try {
      if (!lastDocument) return;
      setLoading(true);
      const snapshots = await ordersRef
        .orderBy('createdAt', 'desc')
        .startAfter(lastDocument)
        .limit(ordersQueryLimit)
        .get();
      const newOrders = snapshots.docs.map((snapshot) =>
        snapshotToDoc<Order>(snapshot)
      );
      const lastVisible = snapshots.docs[snapshots.docs.length - 1];
      setLastDocument(lastVisible);
      // combine new orders with existing state
      setOrders((prev) => (prev ? [...prev, ...newOrders] : newOrders));
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Query orders from firestore (first query)

  useEffect(() => {
    let unsubscribe: () => void;
    if (!userInfo) return setOrders(null);
    setLoading(true);
    if (isClient(userInfo.role)) {
      // if user is client, query only their orders
      unsubscribe = ordersRef
        .where('user.id', '==', userInfo.id)
        .orderBy('createdAt', 'desc')
        .onSnapshot({
          next: (snapshots) => {
            const orders: Order[] = [];
            snapshots.forEach((snapshot) => {
              const order = snapshotToDoc<Order>(snapshot);
              orders.push(order);
            });
            setOrders(orders);
            setLoading(false);
          },
          error: (err) => {
            setError(err.message);
            setOrders(null);
            setLoading(false);
          },
        });
    } else if (isAdmin(userInfo.role)) {
      // if user is admin, query all orders
      unsubscribe = ordersRef
        .orderBy('createdAt', 'desc')
        .limit(ordersQueryLimit)
        .onSnapshot({
          next: (snapshots) => {
            const orders = snapshots.docs.map((snapshot) =>
              snapshotToDoc<Order>(snapshot)
            );
            const lastVisible = snapshots.docs[snapshots.docs.length - 1];
            setLastDocument(lastVisible);
            setOrders(orders);
            setLoading(false);
          },
          error: (err) => {
            setError(err.message);
            setOrders(null);
            setLoading(false);
          },
        });
    }
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  return (
    <OrdersStateContext.Provider
      value={{ orders, queryMoreOrders, loading, error }}
    >
      <OrdersDispatchContext.Provider value={{ setOrders }}>
        {children}
      </OrdersDispatchContext.Provider>
    </OrdersStateContext.Provider>
  );
};

export default OrdersContextProvider;

export const useOrdersContext = () => {
  const ordersState = useContext(OrdersStateContext);
  const ordersDispatch = useContext(OrdersDispatchContext);

  if (ordersState === undefined || ordersDispatch === undefined)
    throw new Error(
      'useOrdersContext must be used within OrdersContextProvider'
    );

  return { ordersState, ordersDispatch };
};
