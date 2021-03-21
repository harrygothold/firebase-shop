import { functions } from '../firebase/config';
import { Role } from '../types';
import { useAsyncCall } from './useAsyncCall';

export const useUpdateRole = () => {
  const { loading, error, setLoading, setError } = useAsyncCall();

  const updateRole = async (userId: string, newRole: Role) => {
    try {
      setLoading(true);
      const updateUserRole = functions.httpsCallable('updateUserRole');

      await updateUserRole({ userId, newRole });
      return true;
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { updateRole, loading, error };
};
