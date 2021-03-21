import React, { FC } from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { useForm } from 'react-hook-form';
import { SignUpData } from '../../types';
import { useAuthenticate } from '../../hooks/useAuthenticate';
import { useModalContext } from '../../state/modal-context';
import SocialMediaLogin from './SocialMediaLogin';

interface Props {}

const Signup: FC<Props> = () => {
  const { register, errors, handleSubmit } = useForm<SignUpData>();
  const { setModalType } = useModalContext();
  const { signUp, loading, error, socialLogin } = useAuthenticate();

  const handleSignUp = handleSubmit(async (data) => {
    const response = await signUp(data);
    if (response) {
      setModalType('close');
    }
  });

  return (
    <>
      <div className="backdrop" onClick={() => setModalType('close')}></div>
      <div className="modal modal--auth-form">
        <div className="modal-close" onClick={() => setModalType('close')}>
          &times;
        </div>
        <h3 className="header--center paragraph--orange">
          Sign Up to AwesomeShop
        </h3>
        <SocialMediaLogin loading={loading} socialLogin={socialLogin} />
        <hr />
        <p className="paragraph--center paragraph--focus paragraph--small">
          Or Sign up with an email
        </p>
        <form onSubmit={handleSignUp} className="form">
          <Input
            name="username"
            label="Username"
            placeholder="Your Username"
            error={errors.username?.message}
            ref={register({
              required: 'Username is required.',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
              },
              maxLength: {
                value: 20,
                message: 'Username must not be greater than 20 characters',
              },
            })}
          />
          <Input
            name="email"
            label="Email"
            placeholder="Your Email"
            error={errors.email?.message}
            ref={register({
              required: 'Email is required.',
              pattern: {
                value: /^[A-Z0-0._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email is in the wrong format',
              },
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
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              maxLength: {
                value: 50,
                message: 'Password must not be greater than 50 characters',
              },
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
          Already have an account?
          <span
            className="paragraph--orange paragraph--link"
            onClick={() => setModalType('signin')}
          >
            sign in
          </span>
          instead.
        </p>
      </div>
    </>
  );
};

export default Signup;
