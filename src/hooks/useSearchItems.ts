import { useSearchContext } from '../state/search-context';
import { useAsyncCall } from './useAsyncCall';
import { ordersIndex, productsIndex, usersIndex } from '../algolia';
import { firebase } from '../firebase/config';
import { SearchedOrder, SearchedProduct, SearchUser } from '../types';

const productRoutes = ['/', '/products', '/admin/manage-products'];
const orderRoutes = ['/admin/manage-orders'];

export const useSearchItems = (pathname: string) => {
  const { loading, setLoading, error, setError } = useAsyncCall();

  const { setSearchedItems } = useSearchContext();

  const searchItems = async (searchString: string) => {
    try {
      setLoading(true);
      if (productRoutes.includes(pathname)) {
        const result = await productsIndex.search<SearchedProduct>(
          searchString
        );
        const products = result.hits.map((item) => {
          const createdAt = firebase.firestore.Timestamp.fromDate(
            new Date(item.createdAt._seconds + 1000)
          );
          const updatedAt = item.updatedAt
            ? firebase.firestore.Timestamp.fromDate(
                new Date(item.updatedAt._seconds + 1000)
              )
            : undefined;
          return { ...item, id: item.objectID, createdAt, updatedAt };
        });

        setSearchedItems(products);
        return true;
      } else if (orderRoutes.includes(pathname)) {
        const result = await ordersIndex.search<SearchedOrder>(searchString);
        const orders = result.hits.map((item) => {
          const createdAt = firebase.firestore.Timestamp.fromDate(
            new Date(item.createdAt._seconds + 1000)
          );
          const updatedAt = item.updatedAt
            ? firebase.firestore.Timestamp.fromDate(
                new Date(item.updatedAt._seconds + 1000)
              )
            : undefined;
          return { ...item, id: item.objectID, createdAt, updatedAt };
        });

        setSearchedItems(orders);
      } else if (pathname === '/admin/manage-users') {
        const result = await usersIndex.search<SearchUser>(searchString);
        const users = result.hits.map((item) => {
          const createdAt = firebase.firestore.Timestamp.fromDate(
            new Date(item.createdAt._seconds + 1000)
          );
          const updatedAt = item.updatedAt
            ? firebase.firestore.Timestamp.fromDate(
                new Date(item.updatedAt._seconds + 1000)
              )
            : undefined;
          return { ...item, id: item.objectID, createdAt, updatedAt };
        });

        setSearchedItems(users);
      }
    } catch (error) {
      setError('Sorry, something went wrong');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { searchItems, loading, error };
};
