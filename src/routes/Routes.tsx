import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Index from '../pages/Index';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import PageNotFound from '../pages/PageNotFound';
import BuyRoutes from './BuyRoutes';
import OrderRoutes from './OrderRoutes';
import AdminRoutes from './AdminRoutes';
import PrivateRoute from './PrivateRoute';
interface Props {}

const Routes: React.FC<Props> = () => {
  return (
    <Switch>
      <Route path="/buy">
        <PrivateRoute>
          <BuyRoutes />
        </PrivateRoute>
      </Route>
      <Route path="/orders">
        <PrivateRoute>
          <OrderRoutes />
        </PrivateRoute>
      </Route>
      <Route path="/admin">
        <PrivateRoute>
          <AdminRoutes />
        </PrivateRoute>
      </Route>
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/products" component={Products} />
      <Route path="/" exact component={Index} />
      <Route path="/*" component={PageNotFound} />
    </Switch>
  );
};

export default Routes;
