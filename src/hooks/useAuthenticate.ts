import { SignUpData, SocialProvider } from '../types';
import { useAuthContext, openUserDropdown } from '../state/auth-context';
import { auth, functions, firebase } from '../firebase/config';
import { useAsyncCall } from './useAsyncCall';

export const useAuthenticate = () => {
  const {
    loading,
    setLoading,
    error,
    setError,
    setSuccessMessage,
    successMessage,
  } = useAsyncCall();
  const {
    authDispatch,
    authState: { isUserDropdownOpen },
  } = useAuthContext();
  const signUp = async (data: SignUpData) => {
    const { username, email, password } = data;
    try {
      setLoading(true);
      const response = await auth.createUserWithEmailAndPassword(
        email,
        password
      );

      if (!response) {
        setError('Sorry, something went wrong.');
        setLoading(false);
        return;
      }

      // update user displayname is firebase
      await auth.currentUser?.updateProfile({
        displayName: username,
      });

      const onSignup = functions.httpsCallable('onSignup');
      const data = await onSignup({ username });

      setLoading(false);
      return data;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const signout = () => {
    auth
      .signOut()
      .then(() => {
        if (isUserDropdownOpen) {
          authDispatch(openUserDropdown(false));
        }
      })
      .catch((err) => alert('Sorry, something went wrong'));
  };

  const signin = async (data: Omit<SignUpData, 'username'>) => {
    const { email, password } = data;
    setLoading(true);
    try {
      const response = await auth.signInWithEmailAndPassword(email, password);
      if (!response) {
        setError('Sorry, something went wrong.');
        setLoading(false);
        return;
      }
      return response;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = (data: Pick<SignUpData, 'email'>) => {
    setLoading(true);
    auth
      .sendPasswordResetEmail(data.email)
      .then(() => {
        setSuccessMessage('Please check your email to reset your password');
        setLoading(false);
      })
      .catch((err) => {
        const { message } = err as { message: string };
        setError(message);
      });
  };

  const socialLogin = async (provider: SocialProvider) => {
    try {
      setLoading(true);
      const providerObj =
        provider === 'facebook'
          ? new firebase.auth.FacebookAuthProvider()
          : provider === 'google'
          ? new firebase.auth.GoogleAuthProvider()
          : null;

      if (!providerObj) return;

      const response = await auth.signInWithPopup(providerObj);
      if (!response) {
        setError('Sorry, something went wrong.');
        setLoading(false);
        return;
      }
      const onSignup = functions.httpsCallable('onSignup');
      const data = await onSignup({ username: response.user?.displayName });

      return data;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    loading,
    error,
    signout,
    signin,
    resetPassword,
    successMessage,
    socialLogin,
  };
};
