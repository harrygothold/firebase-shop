import { FC } from 'react';
import { NavLink } from 'react-router-dom';

interface Props {}

const ClientDropdown: FC<Props> = () => {
  return (
    <div className="sidebar__section sidebar__section--nav">
      <li className="list">
        <NavLink to="/products" className="list-link">
          PRODUCTS
        </NavLink>
      </li>
      <li className="list">
        <NavLink to="/buy/my-cart" className="list-link">
          MY CART
        </NavLink>
      </li>
      <li className="list">
        <NavLink to="/orders/my-orders" className="list-link">
          MY ORDERS
        </NavLink>
      </li>
    </div>
  );
};

export default ClientDropdown;
