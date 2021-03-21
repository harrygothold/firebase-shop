import { FC } from 'react';
import Button from '../Button/Button';
import { useModalContext } from '../../state/modal-context';

interface Props {}

const LoggedOutNav: FC<Props> = () => {
  const { setModalType } = useModalContext();
  return (
    <ul className="navbar">
      <div className="navbar__profile">
        <>
          <Button className="btn--sign" onClick={() => setModalType('signin')}>
            Sign In
          </Button>
          <Button className="btn--sign" onClick={() => setModalType('signup')}>
            Sign Up
          </Button>
        </>
      </div>
    </ul>
  );
};

export default LoggedOutNav;
