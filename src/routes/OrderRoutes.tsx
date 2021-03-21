import React, { FC } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import OrdersContextProvider from '../state/orders-context';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import PageNotFound from '../pages/PageNotFound';
import { isClient } from '../helpers';
import { UserInfo } from '../types';

interface Props {}

const OrderRoutes: FC<Props> = (props) => {
  const { userInfo } = props as { userInfo: UserInfo };

  if (!isClient(userInfo.role)) return <Redirect to="/" />;
  return (
    <OrdersContextProvider>
      <Switch>
        <Route path="/orders/my-orders/:id" component={OrderDetail} />
        <Route path="/orders/my-orders" component={Orders} />
        <Route path="*" component={PageNotFound} />
      </Switch>
    </OrdersContextProvider>
  );
};

export default OrderRoutes;
