import React, {
  FC,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from 'react';
import { firebase } from '../firebase/config';
import { Product, ProductTab } from '../types';
import { productsRef, snapshotToDoc, productCountsRef } from '../firebase';
import { useAsyncCall } from '../hooks/useAsyncCall';

const limitQuery = 9;

interface Props {}

type Products = {
  [key in ProductTab]: Product[];
};

type ProductCounts = {
  [key in ProductTab]: number;
};

type ProductsState = {
  products: Products;
  productCounts: ProductCounts;
  queryMoreProducts: () => void;
  loading: boolean;
  error: string;
};

type ProductsDispatch = {
  setProducts: Dispatch<SetStateAction<Products>>;
};

const ProductsStateContext = createContext<ProductsState | undefined>(
  undefined
);

const ProductsDispatchContext = createContext<ProductsDispatch | undefined>(
  undefined
);

const initialProducts: Products = {
  All: [],
  Clothing: [],
  Shoes: [],
  Watches: [],
  Accessories: [],
};

const initalProductCounts: ProductCounts = {
  All: 0,
  Clothing: 0,
  Shoes: 0,
  Watches: 0,
  Accessories: 0,
};

const ProductsContextProvider: FC<Props> = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);
  const [productCounts, setProductCounts] = useState(initalProductCounts);
  const [
    lastDocument,
    setLastDocument,
  ] = useState<firebase.firestore.DocumentData>();

  const { error, setError, loading, setLoading } = useAsyncCall();

  const queryMoreProducts = async () => {
    try {
      if (!lastDocument) return;
      setLoading(true);
      const snapshots = await productsRef
        .orderBy('createdAt', 'desc')
        .startAfter(lastDocument)
        .limit(limitQuery)
        .get();
      const newQueries: Product[] = snapshots.docs.map((snapshot) =>
        snapshotToDoc<Product>(snapshot)
      );
      const lastVisible = snapshots.docs[snapshots.docs.length - 1];
      setLastDocument(lastVisible);
      // combine new queries with existing state
      setProducts((prev) => {
        const updatedProducts: any = {};
        Object.keys(initialProducts).forEach((cat) => {
          const category = cat as ProductTab;
          category === 'All'
            ? (updatedProducts.All = [...prev.All, ...newQueries])
            : (updatedProducts[category] = [
                ...prev[category],
                ...newQueries.filter((item) => item.category === category),
              ]);
        });
        return updatedProducts;
      });
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products collection from firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = productsRef
      .orderBy('createdAt', 'desc')
      .limit(limitQuery)
      .onSnapshot({
        next: (snapshots) => {
          const allProducts: Product[] = snapshots.docs.map((snapshot) =>
            snapshotToDoc<Product>(snapshot)
          );
          // snapshots.forEach((snapshot) => {
          //   const product = snapshotToDoc<Product>(snapshot);
          //   allProducts.push(product);
          // });
          const lastVisible = snapshots.docs[snapshots.docs.length - 1];
          setLastDocument(lastVisible);
          const updatedProducts: any = {};
          Object.keys(initialProducts).forEach((cat) => {
            const category = cat as ProductTab;
            category === 'All'
              ? (updatedProducts.All = allProducts)
              : (updatedProducts[category] = allProducts.filter(
                  (item) => item.category === category
                ));
          });
          setProducts(updatedProducts);
          setLoading(false);
        },
        error: (err) => {
          setError(err.message);
          setLoading(false);
        },
      });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  // Fetch product-counts collection from firestor
  useEffect(() => {
    const unsubscribe = productCountsRef
      .doc('counts')
      .onSnapshot((snapshot) => {
        const countsData = snapshot.data() as ProductCounts;
        setProductCounts(countsData);
      });
    return () => unsubscribe();
  }, []);

  return (
    <ProductsStateContext.Provider
      value={{ products, loading, error, productCounts, queryMoreProducts }}
    >
      <ProductsDispatchContext.Provider value={{ setProducts }}>
        {children}
      </ProductsDispatchContext.Provider>
    </ProductsStateContext.Provider>
  );
};

export default ProductsContextProvider;

export const useProductsContext = () => {
  const productsState = useContext(ProductsStateContext);
  const productsDispatch = useContext(ProductsDispatchContext);

  if (productsDispatch === undefined || productsState === undefined) {
    throw new Error(
      'useProductsContext must be used within ProductsContextProvider'
    );
  }

  return { productsState, productsDispatch };
};
