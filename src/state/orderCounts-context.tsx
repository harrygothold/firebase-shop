import {
  FC,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from 'react';
import { useAuthContext } from './auth-context';
import { isAdmin } from '../helpers';
import { orderCountsRef } from '../firebase';

interface Props {}

type OrderCountsState = {
  orderCounts: number;
};

type OrderCountsDispatch = {
  setOrderCounts: Dispatch<SetStateAction<number>>;
};

const OrderCountsStateContext = createContext<OrderCountsState | undefined>(
  undefined
);
const OrderCountsDispatchContext = createContext<
  OrderCountsDispatch | undefined
>(undefined);

const OrderCountsContextProvider: FC<Props> = ({ children }) => {
  const [orderCounts, setOrderCounts] = useState(0);
  const {
    authState: { userInfo },
  } = useAuthContext();

  useEffect(() => {
    if (!userInfo || !isAdmin(userInfo.role)) return setOrderCounts(0);
    const unsubscribe = orderCountsRef.doc('counts').onSnapshot((snapshot) => {
      const { orderCounts } = snapshot.data() as { orderCounts: number };
      setOrderCounts(orderCounts);
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  return (
    <OrderCountsStateContext.Provider value={{ orderCounts }}>
      <OrderCountsDispatchContext.Provider value={{ setOrderCounts }}>
        {children}
      </OrderCountsDispatchContext.Provider>
    </OrderCountsStateContext.Provider>
  );
};

export default OrderCountsContextProvider;

export const useOrderCountsContext = () => {
  const orderCountsState = useContext(OrderCountsStateContext);
  const orderCountsDispatch = useContext(OrderCountsDispatchContext);

  if (orderCountsState === undefined || orderCountsDispatch === undefined)
    throw new Error(
      'useOrderCountsContext must be used within OrderCountsContextProvider'
    );

  return { orderCountsState, orderCountsDispatch };
};
