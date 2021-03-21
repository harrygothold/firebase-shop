import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../Button/Button';
import { SocialProvider } from '../../types';
import { useModalContext } from '../../state/modal-context';
import { firebase } from '../../firebase/config';

interface Props {
  socialLogin: (
    provider: SocialProvider
  ) => Promise<firebase.functions.HttpsCallableResult | undefined>;
  loading: boolean;
}

const SocialMediaLogin: FC<Props> = ({ socialLogin, loading }) => {
  const { setModalType } = useModalContext();
  const handleSocialLogin = async (provider: SocialProvider) => {
    const response = await socialLogin(provider);
    if (response) {
      setModalType('close');
    }
  };
  return (
    <div className="social">
      <Button
        className="social-btn social-btn--fb"
        width="100%"
        height="3rem"
        onClick={() => handleSocialLogin('facebook')}
        disabled={loading}
      >
        <FontAwesomeIcon icon={['fab', 'facebook-f']} size="1x" />
        <span>Login with Facebook</span>
      </Button>
      <Button
        className="social-btn social-btn--google"
        width="100%"
        height="3rem"
        onClick={() => handleSocialLogin('google')}
        disabled={loading}
      >
        <FontAwesomeIcon icon={['fab', 'google']} size="1x" />
        <span>Login with Google</span>
      </Button>
    </div>
  );
};

export default SocialMediaLogin;
