import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DialogWrapper from './DialogWrapper';
import { Product } from '../../types';
import Button from '../Button/Button';

interface Props {
  header: string;
  cartItemData: {
    product: Product;
    quantity: number;
  } | null;
  goToCart: () => void;
  continueShopping: () => void;
}

const ConfirmAddToCartDialog: FC<Props> = ({
  header,
  cartItemData,
  goToCart,
  continueShopping,
}) => {
  return (
    <DialogWrapper header={header}>
      <div className="dialog-body">
        <div className="dialog-body__cart-info">
          <FontAwesomeIcon
            icon={['fas', 'check-circle']}
            size="lg"
            color="green"
          />
          <img
            width="30px"
            src={cartItemData?.product.imageUrl}
            alt={cartItemData?.product.title}
          />
          <p className="paragraph">{cartItemData?.product.title}</p>
          <p className="paragraph">{cartItemData?.quantity}</p>

          <Button onClick={goToCart}>Go to Cart</Button>
        </div>
        <Button
          onClick={continueShopping}
          width="13rem"
          className="btn--orange"
        >
          Continue Shopping
        </Button>
      </div>
    </DialogWrapper>
  );
};

export default ConfirmAddToCartDialog;
