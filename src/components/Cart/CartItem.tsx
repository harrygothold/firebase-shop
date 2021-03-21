import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Spinner from '../Spinner/Spinner';
import { useManageCart } from '../../hooks/useManageCart';
import { CartItem } from '../../types';
import { formatAmount } from '../../helpers';

interface Props {
  cartItem: CartItem;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  setCartItemToDelete: (item: CartItem | null) => void;
}

const MyCartItem: React.FC<Props> = ({
  cartItem,
  openDialog,
  setOpenDialog,
  setCartItemToDelete,
}) => {
  const {
    quantity,
    user,
    item: { id, title, description, price, imageUrl, inventory },
  } = cartItem;

  const { addToCart, loading, error } = useManageCart();

  const [newQuantity, setNewQuantity] = useState(quantity);

  useEffect(() => {
    if (!openDialog) {
      if (newQuantity !== quantity) setNewQuantity(quantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDialog, quantity]);

  return (
    <div className="cart-item">
      <img src={imageUrl} alt={title} className="cart-item__img" />

      <div className="cart-item__detail">
        <h4 className="header">{title}</h4>

        <p className="paragraph paragraph--focus">{description}</p>

        <p className="paragraph">
          Price:{' '}
          <span className="paragraph--orange paragraph--focus">
            ${formatAmount(price)}
          </span>
        </p>

        <div className="cart-item__update-qty">
          <div className="quantity-control">
            <div
              className="qty-action"
              onClick={() =>
                setNewQuantity((prev) => {
                  if (prev === 0) return prev;

                  return prev - 1;
                })
              }
            >
              <FontAwesomeIcon icon={['fas', 'minus']} size="xs" color="red" />
            </div>

            <div className="qty-action">
              {quantity === newQuantity ? (
                <p className="paragraph">{quantity}</p>
              ) : (
                <p className="paragraph--bold">{newQuantity}</p>
              )}
            </div>

            <div
              className="qty-action"
              onClick={() =>
                setNewQuantity((prev) => {
                  if (prev === inventory) return prev;
                  return prev + 1;
                })
              }
            >
              <FontAwesomeIcon
                icon={['fas', 'plus']}
                size="xs"
                color="#282c34"
              />
            </div>
          </div>

          {quantity !== newQuantity && (
            <div className="quantity-update-action">
              {loading ? (
                <Spinner color="grey" />
              ) : (
                <p
                  className="paragraph paragraph--success paragraph--focus"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (quantity === newQuantity) return;

                    if (newQuantity === 0) {
                      setCartItemToDelete(cartItem);
                      setOpenDialog(true);
                      return;
                    }

                    return addToCart(
                      id,
                      newQuantity - quantity,
                      user,
                      inventory
                    );
                  }}
                >
                  Confirm
                </p>
              )}
              <p
                className="paragraph paragraph--error paragraph--focus"
                style={{ cursor: 'pointer' }}
                onClick={() => setNewQuantity(quantity)}
              >
                Cancel
              </p>
            </div>
          )}
        </div>

        <p
          className="paragraph paragraph--error paragraph--focus"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setCartItemToDelete(cartItem);
            setOpenDialog(true);
          }}
        >
          Remove
        </p>

        {error && <p className="paragraph paragraph--error">{error}</p>}
      </div>

      <div className="cart-item__amount">
        <h4 className="header">Amount</h4>
        <p className="paragraph paragraph--focus paragraph-bold">
          ${formatAmount(quantity * price)}
        </p>
      </div>
    </div>
  );
};

export default MyCartItem;
