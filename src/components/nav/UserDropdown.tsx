import { FC } from 'react';
import Button from '../Button/Button';
import {
  useAuthContext,
  openUserDropdown,
  signoutRedirect,
} from '../../state/auth-context';
import { useAuthenticate } from '../../hooks/useAuthenticate';
import ClientDropdown from './ClientDropdown';
import AdminDropdown from './AdminDropdown';
import { isAdmin, isClient } from '../../helpers';
import { useViewContext } from '../../state/view-context';

interface Props {}

const UserDropdown: FC<Props> = () => {
  const { viewMode } = useViewContext();
  const {
    authState: { authUser, userInfo },
    authDispatch,
  } = useAuthContext();
  const { signout } = useAuthenticate();
  return (
    <div className="page page--sidebar">
      <div
        className="sidebar sidebar-show"
        onMouseLeave={() => authDispatch(openUserDropdown(false))}
      >
        <div className="sidebar__section sidebar__section--profile">
          <h3 className="header--center header--sidebar">
            {authUser?.displayName}
          </h3>
          <h3 className="header--center header--sidebar">{authUser?.email}</h3>
        </div>

        {userInfo && isAdmin(userInfo.role) && <AdminDropdown />}
        {((userInfo && isClient(userInfo.role)) ||
          (userInfo && isAdmin(userInfo.role) && viewMode === 'client')) && (
          <ClientDropdown />
        )}
        <div className="sidebar__section">
          <Button
            onClick={() => {
              signout();
              authDispatch(signoutRedirect(true));
            }}
            className="btn--sidebar-signout"
          >
            Sign Out
          </Button>
        </div>
        <div className="sidebar__section">
          <Button
            onClick={() => authDispatch(openUserDropdown(false))}
            className="sidebar__close"
          >
            &times;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDropdown;
