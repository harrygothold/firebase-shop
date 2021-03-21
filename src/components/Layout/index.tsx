import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainNav from '../nav/MainNav';
import UserDropdown from '../nav/UserDropdown';
import { useAuthContext, openUserDropdown } from '../../state/auth-context';
import { useModalContext } from '../../state/modal-context';
import ViewContextProvider from '../../state/view-context';

interface Props {}

const Layout: FC<Props> = ({ children }) => {
  const {
    authState: { isUserDropdownOpen },
    authDispatch,
  } = useAuthContext();
  const { modal } = useModalContext();

  const location = useLocation();

  useEffect(() => {
    if (isUserDropdownOpen) {
      authDispatch(openUserDropdown(false));
    }
    // eslint-disable-next-line
  }, [location.pathname]);
  return (
    <div>
      <ViewContextProvider>
        <MainNav />
        {isUserDropdownOpen && <UserDropdown />}
      </ViewContextProvider>
      <div className="page">{children}</div>
      {modal && modal}
    </div>
  );
};

export default Layout;
