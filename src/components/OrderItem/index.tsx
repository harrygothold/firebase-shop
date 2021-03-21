import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  formatAmount,
  calculateCartAmount,
  calculateCartQuantity,
  shippingStatusColour,
} from '../../helpers';
import { Order } from '../../types';

interface Props {
  order: Order;
}

const OrderItem: FC<Props> = ({ order }) => {
  return (
    <Link to={`/orders/my-orders/${order.id}`}>
      <div className="orders-content orders-content--content">
        <div className="orders-column">
          <p className="paragraph--center paragraph--focus">
            {order.createdAt.toDate().toDateString()}
          </p>
        </div>
        <div className="orders-column">
          <p className="paragraph--center paragraph--focus">
            {calculateCartQuantity(order.items)}
          </p>
        </div>
        <div className="orders-column">
          <p className="paragraph--center paragraph--focus">
            {formatAmount(calculateCartAmount(order.items))}
          </p>
        </div>
        <div className="orders-column">
          <p
            className="paragraph--center paragraph--focus"
            style={{ color: shippingStatusColour(order.shipmentStatus) }}
          >
            {order.shipmentStatus ? order.shipmentStatus : ''}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default OrderItem;
