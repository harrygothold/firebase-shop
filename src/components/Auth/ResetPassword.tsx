import React, { FC } from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { useForm } from 'react-hook-form';
import { SignUpData } from '../../types';
import { useAuthenticate } from '../../hooks/useAuthenticate';
import { useModalContext } from '../../state/modal-context';

interface Props {}

const ResetPassword: FC<Props> = () => {
  const { register, errors, handleSubmit } = useForm<
    Omit<SignUpData, 'username' | 'password'>
  >();
  const { setModalType } = useModalContext();
  const { loading, error, resetPassword, successMessage } = useAuthenticate();

  const handleResetPassword = handleSubmit((data) => resetPassword(data));

  return (
    <>
      <div className="backdrop" onClick={() => setModalType('close')}></div>
      <div className="modal modal--auth-form">
        <div className="modal-close" onClick={() => setModalType('close')}>
          &times;
        </div>
        <h5 className="header--center paragraph--orange">
          Enter your email below to reset your password
        </h5>
        <form onSubmit={handleResetPassword} className="form">
          <Input
            name="email"
            placeholder="Your Email"
            error={errors.email?.message}
            ref={register({
              required: 'Email is required.',
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
        {successMessage && (
          <p className="paragraph--success paragraph--small">
            {successMessage}
          </p>
        )}
      </div>
    </>
  );
};

export default ResetPassword;
