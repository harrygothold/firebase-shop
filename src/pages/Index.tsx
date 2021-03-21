import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Tab from '../components/Tab';
import ProductItem from '../components/Products/ProductItem';
import Spinner from '../components/Spinner/Spinner';
import { useProductsContext } from '../state/products-context';
import { useAuthContext } from '../state/auth-context';
import { useModalContext } from '../state/modal-context';
import { useSearchContext } from '../state/search-context';
import { useSelectTab } from '../hooks/useSelectTab';
import { usePagination } from '../hooks/usePagination';
import { Product, ProductTab } from '../types';
import { productTabs } from '../helpers';
import Pagination from '../components/Pagination';

export const prodTabType = 'cat';
export const productsPerPage = 6;

interface Props {}

const Index: React.FC<Props> = () => {
  const { searchedItems } = useSearchContext();

  const [paginatedSearchItems, setPaginatedSearchItems] = useState(
    searchedItems
  );
  const { activeTab } = useSelectTab<ProductTab>(prodTabType, 'All');

  const history = useHistory<{ from: string }>();
  const { state } = history.location;
  const { setModalType } = useModalContext();
  const {
    authState: { authUser, signoutRedirect },
  } = useAuthContext();

  const {
    productsState: { products, loading, productCounts, queryMoreProducts },
  } = useProductsContext();

  const { page, totalPages } = usePagination<ProductTab, Product>(
    productCounts[activeTab],
    productsPerPage,
    activeTab,
    searchedItems as Product[]
  );

  const [productsByCat, setProductsByCat] = useState(products[activeTab]);

  useEffect(() => {
    // open the sign in modal
    if (!signoutRedirect) {
      if (state?.from) {
        if (!authUser) {
          setModalType('signin');
        } else {
          history.push(state.from);
        }
      }
    } else {
      history.replace('/', undefined);
    }
  }, [setModalType, state, authUser, history, signoutRedirect]);

  // When tab changes
  useEffect(() => {
    const startIndex = productsPerPage * (page - 1);
    const endIndex = productsPerPage * page;
    if (searchedItems) {
      setPaginatedSearchItems(searchedItems.slice(startIndex, endIndex));
      setProductsByCat([]);
    } else {
      if (
        products[activeTab].length < productCounts[activeTab] &&
        products[activeTab].length < productsPerPage * productsPerPage
      ) {
        return queryMoreProducts();
      }
      setProductsByCat(products[activeTab].slice(startIndex, endIndex));
      setPaginatedSearchItems(null);
    }
    // eslint-disable-next-line
  }, [activeTab, products, page, searchedItems, productCounts]);

  if (loading) return <Spinner color="grey" width={50} height={50} />;

  if (!loading && products.All.length === 0)
    return <h2 className="header--center">No Products</h2>;

  return (
    <div className="page--products">
      <div className="products-category">
        {productTabs.map((cat) => (
          <Tab
            activeTab={activeTab}
            key={cat}
            label={cat}
            tabType={prodTabType}
            withPagination={true}
          />
        ))}
      </div>
      <div className="pagination-container">
        <Pagination
          page={page}
          totalPages={totalPages}
          tabType={searchedItems ? undefined : prodTabType}
          activeTab={searchedItems ? undefined : activeTab}
        />
      </div>
      <div className="products">
        {paginatedSearchItems ? (
          <>
            {paginatedSearchItems.length < 1 ? (
              <h2 className="header--center">No products found</h2>
            ) : (
              (paginatedSearchItems as Product[]).map((product) => (
                <ProductItem key={product.id} product={product} />
              ))
            )}
          </>
        ) : (
          productsByCat.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default Index;
