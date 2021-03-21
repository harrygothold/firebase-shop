import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  formatAmount,
  calculateCartAmount,
  calculateCartQuantity,
  shippingStatusColour,
} from '../../helpers';
import { Order } from '../../types';
import Button from '../Button/Button';

interface Props {
  order: Order;
}

const ManageOrderItem: FC<Props> = ({ order }) => {
  return (
    <Link to={`/admin/manage-orders/${order.id}`}>
      <div className="orders-content orders-content--content">
        <div className="orders-column">
          <p className="paragraph--center paragraph--focus">
            {order.createdAt.toDate().toDateString()}
          </p>
        </div>
        <div className="orders-column orders-column--hide">
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
        <div className="orders-column orders-column--hide">
          <p className="paragraph--center paragraph--focus">
            {order.user.name}
          </p>
        </div>
        <div className="orders-column orders-column--manage">
          <p className="paragraph--center paragraph--focus">
            {order.shipmentStatus === 'Delivered' ? (
              'Done'
            ) : (
              <Button
                width="60%"
                className="btn--orange manage-order-btn--mobile"
              >
                Manage Order
              </Button>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ManageOrderItem;
