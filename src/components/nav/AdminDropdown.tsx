import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useViewContext } from '../../state/view-context';

interface Props {}

const AdminDropdown: FC<Props> = () => {
  const { setViewMode, viewMode } = useViewContext();
  return (
    <>
      <div className="sidebar__section">
        <h3
          onClick={() =>
            setViewMode((prev) => (prev === 'admin' ? 'client' : 'admin'))
          }
          className="header--center header--orange header--link"
        >
          {viewMode === 'admin'
            ? 'Switch to client view'
            : 'Switch to admin view'}
        </h3>
      </div>
      {viewMode === 'admin' && (
        <div className="sidebar__section sidebar__section--nav">
          <li className="list">
            <NavLink className="list-link" to="/admin/manage-products">
              MANAGE PRODUCTS
            </NavLink>
          </li>
          <li className="list">
            <NavLink className="list-link" to="/admin/manage-orders">
              MANAGE ORDERS
            </NavLink>
          </li>
          <li className="list">
            <NavLink className="list-link" to="/admin/manage-users">
              MANAGE USERS
            </NavLink>
          </li>
        </div>
      )}
    </>
  );
};

export default AdminDropdown;
