import React, { FC } from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SignUpData } from '../../types';
import { useAuthenticate } from '../../hooks/useAuthenticate';
import { useModalContext } from '../../state/modal-context';
import SocialMediaLogin from './SocialMediaLogin';

interface Props {}

const SignIn: FC<Props> = () => {
  const { register, errors, handleSubmit } = useForm<
    Omit<SignUpData, 'username'>
  >();
  const { setModalType } = useModalContext();
  const { loading, error, signin, socialLogin } = useAuthenticate();

  const history = useHistory();

  const handleSignIn = handleSubmit(async (data) => {
    const response = await signin(data);
    if (response) {
      setModalType('close');
    }
  });

  return (
    <>
      <div
        className="backdrop"
        onClick={() => {
          history.replace('/', undefined);
          setModalType('close');
        }}
      ></div>
      <div className="modal modal--auth-form">
        <div
          className="modal-close"
          onClick={() => {
            history.replace('/', undefined);
            setModalType('close');
          }}
        >
          &times;
        </div>
        <h3 className="header--center paragraph--orange">
          Sign In to AwesomeShop
        </h3>
        <SocialMediaLogin loading={loading} socialLogin={socialLogin} />
        <hr />
        <p className="paragraph--center paragraph--focus paragraph--small">
          Or Sign up with an email
        </p>
        <form onSubmit={handleSignIn} className="form">
          <Input
            name="email"
            label="Email"
            placeholder="Your Email"
            error={errors.email?.message}
            ref={register({
              required: 'Email is required.',
            })}
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Your Password"
            error={errors.password?.message}
            ref={register({
              required: 'Password is required.',
            })}
          />
          <Button
            loading={loading}
            type="submit"
            style={{ margin: '0.5rem auto' }}
            width="100%"
          >
            Submit
          </Button>
          {error && <p className="paragraph paragraph--error">{error}</p>}
        </form>
        <p className="paragraph paragraph--focus paragraph--small">
          Don't have an account yet?
          <span
            className="paragraph--orange paragraph--link"
            onClick={() => setModalType('signup')}
          >
            sign up
          </span>{' '}
          instead.
        </p>
        <p className="paragraph paragraph--focus paragraph--small">
          Forgot Your Password? Click{' '}
          <span
            className="paragraph--orange paragraph--link"
            onClick={() => setModalType('reset_password')}
          >
            Here
          </span>
        </p>
      </div>
    </>
  );
};

export default SignIn;
