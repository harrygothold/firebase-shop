import React, { useState, useEffect, FC } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Button from '../components/Button/Button';
import Spinner from '../components/Spinner/Spinner';
import { useProductsContext } from '../state/products-context';
import { useAuthContext } from '../state/auth-context';
import { useModalContext } from '../state/modal-context';
import { useManageCart } from '../hooks/useManageCart';
import { Product } from '../types';
import PageNotFound from './PageNotFound';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatAmount, isAdmin, isClient } from '../helpers';
import { useDialog } from '../hooks/useDialog';
import ConfirmAddToCartDialog from '../components/Dialogs/ConfirmAddToCartDialog';
import { useCartContext } from '../state/cart-context';

interface Props {}

const ProductDetail: FC<Props> = () => {
  const {
    addToCart,
    loading: addToCartLoading,
    error: addToCartError,
  } = useManageCart();
  const [quantity, setQuantity] = useState(1);
  const [addedCartItem, setAddedCartItem] = useState<{
    product: Product;
    quantity: number;
  } | null>(null);
  const {
    productsState: { products, loading, error },
  } = useProductsContext();

  const { cart } = useCartContext();

  const params = useParams() as { id: string };
  const [product, setProduct] = useState<Product | undefined>();

  const history = useHistory();

  const {
    authState: { authUser, userInfo },
  } = useAuthContext();

  const { setModalType } = useModalContext();

  const { openDialog, setOpenDialog } = useDialog();

  const handleAddToCart = async (prod: Product) => {
    if (!authUser) {
      setModalType('signin');
      return;
    } else if (authUser && userInfo && isAdmin(userInfo?.role)) {
      alert('You are an admin user. You cannot add to cart');
      return;
    } else if (authUser && userInfo && isClient(userInfo?.role)) {
      if (cart && cart.length > 0) {
        const foundItem = cart.find((item) => item.product === prod.id);
        if (foundItem && foundItem.quantity >= prod.inventory) {
          alert('Cannot add to cart, not enough inventory');
          return;
        }
      }
      const finished = await addToCart(
        prod.id,
        quantity,
        authUser.uid,
        prod.inventory
      );
      if (finished) {
        setOpenDialog(true);
        setAddedCartItem({ product: prod, quantity });
        setQuantity(1);
      }
    }
  };

  useEffect(() => {
    const prod = products.All.find((item) => item.id === params.id);
    if (prod) {
      setProduct(prod);
    } else {
      setProduct(undefined);
    }
  }, [params, products.All]);
  if (loading) return <Spinner color="grey" width={50} height={50} />;
  if (!loading && error) return <h2 className="header">{error}</h2>;
  if (!product) return <PageNotFound />;
  return (
    <div className="page--product-detail">
      <div className="product-detail__section">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="product-image"
        />
      </div>
      <div className="product-detail__section">
        <div className="product-detail__sub-section">
          <h3 className="header">{product.title}</h3>
          <p className="paragraph">{product.description}</p>
        </div>
        <div className="product-detail__sub-section">
          <p className="paragraph">
            Price:{' '}
            <span className="paragraph--orange">
              £{formatAmount(product.price)}
            </span>
          </p>
        </div>
        <div className="product-detail__sub-section product-detail__sub-section--stock">
          <p className="paragraph">
            Availability:{' '}
            <span
              className={`paragraph--success ${
                product.inventory === 0 ? 'paragraph--error' : ''
              }`}
            >
              {product.inventory} pcs
            </span>
          </p>
        </div>
        {product.inventory === 0 ? (
          <p className="paragraph--error">Out of Stock</p>
        ) : (
          <div className="product-detail__sub-section quantity-control">
            <div
              onClick={() =>
                setQuantity((prev) => {
                  if (prev < 2) return prev;
                  return prev - 1;
                })
              }
              style={{ cursor: quantity === 1 ? 'not-allowed' : 'pointer' }}
              className="qty-action"
            >
              <FontAwesomeIcon icon={['fas', 'minus']} size="xs" color="grey" />
            </div>
            <div className="qty-action qty-action--qty">
              <p className="paragraph">{quantity}</p>
            </div>
            <div
              className="qty-action"
              style={{
                cursor:
                  quantity === product.inventory ? 'not-allowed' : 'pointer',
              }}
              onClick={() =>
                setQuantity((prev) => {
                  if (prev === product.inventory) return prev;
                  return prev + 1;
                })
              }
            >
              <FontAwesomeIcon icon={['fas', 'plus']} size="xs" color="grey" />
            </div>
          </div>
        )}
        <Button
          disabled={product.inventory === 0 || addToCartLoading}
          loading={addToCartLoading}
          onClick={() => handleAddToCart(product)}
        >
          Add To Cart
        </Button>
        {addToCartError && <p className="paragraph--error">{addToCartError}</p>}
      </div>
      {openDialog && addedCartItem && (
        <ConfirmAddToCartDialog
          header="Added to Cart"
          cartItemData={addedCartItem}
          goToCart={() => {
            setOpenDialog(false);
            history.push('/buy/my-cart');
          }}
          continueShopping={() => {
            setOpenDialog(false);
            history.push('/');
          }}
        />
      )}
    </div>
  );
};

export default ProductDetail;
