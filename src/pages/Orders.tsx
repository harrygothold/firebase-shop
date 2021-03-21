import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner/Spinner';
import OrderItem from '../components/OrderItem';
import { useOrdersContext } from '../state/orders-context';
import { orderTabs } from '../helpers';
import Tab from '../components/Tab';
import { useSelectTab } from '../hooks/useSelectTab';
import { OrderTab } from '../types';

export const orderTabType = 'type';

interface Props {}

const Orders: React.FC<Props> = () => {
  const {
    ordersState: { orders, loading, error },
  } = useOrdersContext();

  const { activeTab } = useSelectTab<OrderTab>(orderTabType, 'New');

  const [ordersByTab, setOrdersByTab] = useState(
    orders ? orders.filter((order) => order.shipmentStatus === 'New') : null
  );

  useEffect(() => {
    if (!orders) {
      setOrdersByTab(null);
      return;
    }
    if (activeTab === 'All') setOrdersByTab(orders);
    else
      setOrdersByTab(
        orders.filter((order) => order.shipmentStatus === activeTab)
      );
  }, [activeTab, orders, setOrdersByTab]);

  if (loading) return <Spinner color="grey" height={50} width={50} />;
  if (error) return <h2 className="header--center">{error}</h2>;

  if (!orders || orders.length === 0)
    return <h2 className="header--center">You have no orders</h2>;

  return (
    <div className="page--orders">
      <div className="orders-header">
        <h2 className="header header--order">Your Orders</h2>
        <div className="orders-tabs">
          {orderTabs.map((tab) => (
            <Tab
              key={tab}
              label={tab}
              activeTab={activeTab}
              tabType={orderTabType}
            />
          ))}
        </div>
      </div>
      <div className="order-details">
        <div className="orders-content">
          <div className="orders-column">
            <h3 className="header--center">Purchased date</h3>
          </div>
          <div className="orders-column">
            <h3 className="header--center">Quantity</h3>
          </div>
          <div className="orders-column">
            <h3 className="header--center">Amount (£)</h3>
          </div>
          <div className="orders-column">
            <h3 className="header--center">Shipment status</h3>
          </div>
        </div>
        {ordersByTab?.map((order) => (
          <OrderItem key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default Orders;
