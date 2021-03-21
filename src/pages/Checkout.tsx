import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import {
  StripeCardElementChangeEvent,
  PaymentMethod as IPaymentMethod,
} from '@stripe/stripe-js';
import { useForm } from 'react-hook-form';
import Button from '../components/Button/Button';
import Spinner from '../components/Spinner/Spinner';
import AlertDialog from '../components/Dialogs/AlertDialog';
import { useDialog } from '../hooks/useDialog';
import { useCartContext } from '../state/cart-context';
import { useAuthContext } from '../state/auth-context';
import { useCheckout } from '../hooks/useCheckout';
import { useRemoveCard } from '../hooks/useRemoveCard';
import { useFetchCards } from '../hooks/useFetchCards';
import { Redirect, useHistory } from 'react-router-dom';
import { calculateCartAmount, calculateCartQuantity } from '../helpers';
import {
  Address,
  CartItem,
  CreatePaymentIntentsData,
  PaymentMethod,
  UploadOrder,
} from '../types';
import { address_key } from '../components/SelectAddress/ShippingAddress';

const Checkout = () => {
  const [orderSummary, setOrderSummary] = useState<{
    quantity: number;
    amount: number;
    orderItems: CartItem[];
  }>();
  const [useCard, setUseCard] = useState<
    { type: 'new' } | { type: 'saved'; payment_method: string }
  >({ type: 'new' });
  const [disabled, setDisabled] = useState(true);
  const [newCardError, setNewCardError] = useState('');
  const [openSetDefault, setOpenSetDefault] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [loadAddress, setLoadAddress] = useState(true);
  const [cardToDelete, setCardToDelete] = useState<IPaymentMethod | null>(null);
  const [dialogType, setDialogType] = useState<
    'inform_payment' | 'remove_card' | null
  >(null);

  const { cart } = useCartContext();

  const {
    removeCard,
    loading: removeCardLoading,
    error: removeCardError,
  } = useRemoveCard();

  const history = useHistory();

  const { openDialog, setOpenDialog } = useDialog();

  const {
    authState: { userInfo },
  } = useAuthContext();

  const {
    userCards,
    stripeCustomer,
    loading: fetchLoading,
    error: fetchError,
    setUserCards,
  } = useFetchCards(userInfo);

  const {
    completePayment,
    createStripeCustomerId,
    loading,
    error,
  } = useCheckout();

  const elements = useElements();
  const stripe = useStripe();

  const btnRef = useRef<HTMLButtonElement>(null);

  const { register, errors, handleSubmit, reset } = useForm<{
    cardName: string;
    save?: boolean;
    setDefault?: boolean;
  }>();

  useEffect(() => {
    const addressData = window.localStorage.getItem(address_key);
    if (!addressData) {
      setLoadAddress(false);
      return;
    }
    const address = JSON.parse(addressData);
    setAddress(address);
    setLoadAddress(false);
  }, [setAddress, setLoadAddress]);

  useEffect(() => {
    if (cart && cart.length > 0) {
      setOrderSummary({
        quantity: calculateCartQuantity(cart),
        amount: calculateCartAmount(cart),
        orderItems: cart,
      });
    }
  }, [cart]);

  useEffect(() => {
    if (userCards?.data && userCards.data.length > 0) {
      setUseCard({
        type: 'saved',
        payment_method:
          stripeCustomer?.invoice_settings.default_payment_method ||
          userCards.data[0].id,
      });
      setDisabled(false);
      reset();
    } else {
      setUseCard({ type: 'new' });
      setDisabled(true);
      reset();
    }
  }, [userCards?.data, stripeCustomer, reset]);

  const handleClickBtn = () => {
    if (btnRef && btnRef.current) {
      btnRef.current.click();
    }
  };

  const handleCardChange = (e: StripeCardElementChangeEvent) => {
    setDisabled(e.empty || !e.complete);
    setNewCardError(e.error ? e.error.message : '');

    if (e.complete) {
      setNewCardError('');
    }
  };

  const handleCompletePayment = handleSubmit(async (data) => {
    if (!elements || !orderSummary || !stripe || !userInfo || !address) return;

    const { amount, quantity, orderItems } = orderSummary;

    const newOrder: UploadOrder = {
      items: orderItems.map(({ quantity, user, item }) => ({
        quantity,
        user,
        item,
      })),
      amount,
      totalQuantity: quantity,
      shippingAddress: address,
      user: { id: userInfo.id, name: userInfo.username },
    };

    if (useCard.type === 'new') {
      // New Card
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;
      if (typeof data.save === 'boolean') {
        // New Card, not saved
        const createPaymentIntentData: CreatePaymentIntentsData = {
          amount: orderSummary.amount,
        };

        // prepare payment method
        const payment_method: PaymentMethod = {
          card: cardElement,
          billing_details: { name: data.cardName },
        };
        if (data.save) {
          // New Card, saved
          if (!userInfo.stripeCustomerId) {
            // user doesn't have strip id - create new one
            const stripeCustomerId = await createStripeCustomerId();
            createPaymentIntentData.customer = stripeCustomerId;
          } else {
            // User already has - use existing one
            createPaymentIntentData.customer = userInfo.stripeCustomerId;
          }
        }
        const finished = await completePayment(
          { createPaymentIntentData, stripe, payment_method },
          {
            save: data.save,
            setDefault: data.setDefault,
            customerId: createPaymentIntentData.customer,
          },
          newOrder,
          orderItems
        );
        if (finished) {
          setOpenDialog(true);
          setDialogType('inform_payment');
          reset();
        }
      }
    } else if (useCard.type === 'saved' && useCard.payment_method) {
      // Saved Card
      const createPaymentIntentData: CreatePaymentIntentsData = {
        amount: orderSummary.amount,
        customer: stripeCustomer?.id,
        payment_method: useCard.payment_method,
      };

      // prepare payment method
      const payment_method: PaymentMethod = useCard.payment_method;
      const finished = await completePayment(
        { createPaymentIntentData, stripe, payment_method },
        {
          save: data.save,
          setDefault: data.setDefault,
          customerId: stripeCustomer?.id,
        },
        newOrder,
        orderItems
      );
      if (finished) {
        setOpenDialog(true);
        setDialogType('inform_payment');
        reset();
      }
    }
  });

  if (loadAddress) return <Spinner color="grey" height={50} width={50} />;
  if (!address) return <Redirect to="/buy/select-address" />;
  const { fullname, address1, address2, city, zipCode, phone } = address;
  return (
    <div className="page--checkout">
      <div className="payment">
        <h2 className="header">Select a Payment Card</h2>
        <form className="form" onSubmit={handleCompletePayment}>
          {/* Saved Cards */}
          {fetchLoading ? (
            <Spinner color="grey" height={30} width={30} />
          ) : (
            userCards?.data &&
            userCards.data.length > 0 &&
            userCards.data.map((method) => (
              <label key={method.id} className="card" htmlFor={method.id}>
                <input
                  type="radio"
                  name="card"
                  value={method.id}
                  style={{ width: '10%' }}
                  checked={
                    useCard.type === 'saved' &&
                    useCard.payment_method === method.id
                  }
                  onChange={() => {
                    setUseCard({ type: 'saved', payment_method: method.id });
                    setDisabled(false);
                    reset();
                  }}
                />
                <p className="paragraph" style={{ width: '40%' }}>
                  **** **** **** {method.card?.last4}
                </p>
                <p className="paragraph" style={{ width: '10%' }}>
                  {method.card?.brand === 'visa' ? (
                    <FontAwesomeIcon
                      icon={['fab', 'cc-visa']}
                      size="2x"
                      color="#206CAB"
                    />
                  ) : method.card?.brand === 'mastercard' ? (
                    <FontAwesomeIcon
                      icon={['fab', 'cc-mastercard']}
                      size="2x"
                      color="#eb2230"
                    />
                  ) : method.card?.brand === 'amex' ? (
                    <FontAwesomeIcon
                      icon={['fab', 'cc-amex']}
                      size="2x"
                      color="#099DD9"
                    />
                  ) : (
                    method.card?.brand
                  )}
                </p>
                <div style={{ width: '30%' }}>
                  {method.id ===
                  stripeCustomer?.invoice_settings.default_payment_method ? (
                    <p className="paragraph--center paragraph--focus">
                      Default
                    </p>
                  ) : useCard.type === 'saved' &&
                    useCard.payment_method === method.id ? (
                    <div>
                      <input ref={register} type="checkbox" name="setDefault" />
                      <label htmlFor="setDefault" className="set-default-card">
                        Set as Default
                      </label>
                    </div>
                  ) : undefined}
                </div>
                <p
                  className="paragraph"
                  style={{ width: '10%', cursor: 'pointer' }}
                  onClick={() => {
                    setDialogType('remove_card');
                    setCardToDelete(method);
                    setOpenDialog(true);
                  }}
                >
                  <FontAwesomeIcon
                    icon={['fas', 'trash-alt']}
                    size="1x"
                    color="red"
                  />
                </p>
              </label>
            ))
          )}
          {/* New cards */}
          <div className="form--new-card">
            <label htmlFor="newCard" className="card card--new">
              <input
                type="radio"
                name="card"
                checked={useCard.type === 'new'}
                onChange={() => {
                  setUseCard({ type: 'new' });
                  setDisabled(true);
                  reset();
                }}
                style={{ width: '10%' }}
              />
              <h4
                className="paragraph paragraph--bold"
                style={{ width: '30%' }}
              >
                Use new card
              </h4>
              <p className="paragraph" style={{ width: '5%' }}></p>
              <div className="new-card__logo" style={{ width: '45%' }}>
                <FontAwesomeIcon
                  icon={['fab', 'cc-visa']}
                  size="1x"
                  style={{ margin: '0 0.5rem' }}
                  color="#206CAB"
                />
                <FontAwesomeIcon
                  icon={['fab', 'cc-mastercard']}
                  size="1x"
                  style={{ margin: '0 0.5rem' }}
                  color="#eb2230"
                />
                <FontAwesomeIcon
                  icon={['fab', 'cc-amex']}
                  size="1x"
                  style={{ margin: '0 0.5rem' }}
                  color="#099DD9"
                />
              </div>
              <p className="paragraph" style={{ width: '100%' }}></p>
            </label>
            {useCard.type === 'new' && (
              <div className="new-card__form">
                <div className="form__input-container form__input-container--card">
                  <input
                    type="text"
                    className="input input--card-name"
                    name="cardName"
                    placeholder="Name on card"
                    ref={register({ required: 'Card name is required' })}
                  />
                  {errors.cardName && (
                    <p className="paragraph paragraph--small paragraph--error">
                      {errors.cardName.message}
                    </p>
                  )}
                </div>
                <div className="form__input-container form__input-container--card">
                  <CardElement
                    options={{
                      style: {
                        base: { color: 'blue', iconColor: 'blue' },
                        invalid: { color: 'red', iconColor: 'red' },
                      },
                    }}
                    onChange={handleCardChange}
                  />
                  {newCardError && (
                    <p className="paragraph paragraph--error">{newCardError}</p>
                  )}
                </div>
                <div className="form__set-new-card">
                  <div className="form__input-container">
                    <input
                      onClick={() => setOpenSetDefault((prev) => !prev)}
                      type="checkbox"
                      name="save"
                      ref={register}
                    />
                    <label htmlFor="saveCard" className="paragraph">
                      Save This Card
                    </label>
                  </div>
                  {openSetDefault && (
                    <div className="form__input-container">
                      <input type="checkbox" name="setDefault" ref={register} />
                      <label htmlFor="setDefault" className="paragraph">
                        Set as default
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            ref={btnRef}
            disabled={!useCard || disabled || loading || !stripe}
            style={{ display: 'none' }}
          ></button>
        </form>
        {error && <p className="paragraph paragraph--error">{error}</p>}
        {fetchError && (
          <p className="paragraph paragraph--error">{fetchError}</p>
        )}
      </div>
      <div className="summary">
        <div className="summary__section">
          <h3 className="header">Delivery Address</h3>
          <p className="paragraph paragraph--focus">{fullname}: </p>
          <p className="paragraph paragraph--focus">{address1}</p>
          {address2 && <p className="paragraph paragraph--focus">{address2}</p>}
          <p className="paragraph paragraph--focus">
            {city}, {zipCode}
          </p>
          <p className="paragraph paragraph--focus">Tel: {phone}</p>
        </div>
        <div className="summary__section">
          <h3 className="header">Order Summary</h3>
          <div className="order-summary">
            <div>
              <p className="paragraph paragraph--focus">Total Quantity: </p>
              <p className="paragraph paragraph--focus">Total Amount: </p>
            </div>
            <div>
              <p className="paragraph paragraph--focus">
                {orderSummary && orderSummary.quantity} pcs
              </p>
              <p className="paragraph paragraph--focus">
                £{orderSummary && orderSummary.amount}
              </p>
            </div>
          </div>
        </div>
        <div className="summary__section">
          <Button
            onClick={handleClickBtn}
            width="100%"
            loading={loading}
            disabled={!useCard || disabled || loading || !stripe}
            className="btn--orange btn--payment"
          >
            Complete Payment
          </Button>
        </div>
      </div>
      {openDialog && dialogType === 'inform_payment' && (
        <AlertDialog
          header="Confirm Payment"
          message="You have successfully made the payment"
          confirmText="Ok"
          onConfirm={() => {
            setOpenDialog(false);
            setDialogType(null);
            history.replace('/orders/my-orders');
          }}
        />
      )}
      {openDialog && dialogType === 'remove_card' && cardToDelete && (
        <AlertDialog
          header="Please confirm"
          message={`Are you sure you want to remove ${cardToDelete.card?.brand}: **** **** **** ${cardToDelete.card?.last4}?`}
          onCancel={() => {
            setCardToDelete(null);
            setOpenDialog(false);
            setDialogType(null);
          }}
          onConfirm={async () => {
            if (!cardToDelete) return;
            const paymentMethod = await removeCard(cardToDelete.id);
            if (paymentMethod) {
              setCardToDelete(null);
              setDialogType(null);
              setOpenDialog(false);
              setUserCards((prev) =>
                prev
                  ? {
                      data: prev.data.filter(
                        (item) => item.id !== paymentMethod.id
                      ),
                    }
                  : prev
              );
            }
          }}
          loading={removeCardLoading}
          error={removeCardError}
        />
      )}
    </div>
  );
};

export default Checkout;
