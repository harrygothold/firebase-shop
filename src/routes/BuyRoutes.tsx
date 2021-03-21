import { FC } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import MyCart from '../pages/MyCart';
import SelectAddress from '../pages/SelectAddress';
import Checkout from '../pages/Checkout';
import PageNotFound from '../pages/PageNotFound';
import { UserInfo } from '../types';
import { isClient } from '../helpers';

interface Props {}

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

const BuyRoutes: FC<Props> = (props) => {
  const { userInfo } = props as { userInfo: UserInfo };

  if (!isClient(userInfo.role)) return <Redirect to="/" />;
  return (
    <Elements stripe={stripePromise}>
      <Switch>
        <Route path="/buy/my-cart" component={MyCart} />
        <Route path="/buy/select-address" component={SelectAddress} />
        <Route path="/buy/checkout">
          <Checkout />
        </Route>
        <Route path="*" component={PageNotFound} />
      </Switch>
    </Elements>
  );
};

export default BuyRoutes;
