import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import ManageProducts from '../pages/ManageProducts';
import ManageOrders from '../pages/ManageOrders';
import ManageOrderDetail from '../pages/ManageOrderDetail';
import ManageUsers from '../pages/ManageUsers';
import PageNotFound from '../pages/PageNotFound';
import OrdersContextProvider from '../state/orders-context';
import OrderCountsContextProvider from '../state/orderCounts-context';
import { UserInfo } from '../types';
import { isAdmin } from '../helpers';

interface Props {}

const AdminRoutes: React.FC<Props> = (props) => {
  const { userInfo } = props as { userInfo: UserInfo };

  if (userInfo && !isAdmin(userInfo?.role))
    return <Redirect to="buy/my-cart" />;

  return (
    <Switch>
      <Route path="/admin/manage-products">
        <ManageProducts />
      </Route>
      <Route path="/admin/manage-orders/:id">
        <OrdersContextProvider>
          <ManageOrderDetail />
        </OrdersContextProvider>
      </Route>
      <Route path="/admin/manage-orders">
        <OrdersContextProvider>
          <OrderCountsContextProvider>
            <ManageOrders />
          </OrderCountsContextProvider>
        </OrdersContextProvider>
      </Route>
      <Route path="/admin/manage-users">
        <ManageUsers userInfo={userInfo} />
      </Route>
      <Route path="*">
        <PageNotFound />
      </Route>
    </Switch>
  );
};

export default AdminRoutes;
