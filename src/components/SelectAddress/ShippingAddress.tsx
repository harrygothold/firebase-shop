import { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../Button/Button';
import { Address } from '../../types';

export const address_key = 'awesome_shippingAddress';

interface Props {
  address: Address;
  setAddressToEdit: (address: Address | null) => void;
  setOpenDialog: (open: boolean) => void;
  setAddressToDelete: (address: Address | null) => void;
}

const ShippingAddress: FC<Props> = ({
  address,
  setAddressToEdit,
  setOpenDialog,
  setAddressToDelete,
}) => {
  const history = useHistory();
  const { fullname, address1, address2, city, zipCode, phone } = address;
  return (
    <div className="shipping-address">
      <div className="shipping-address__detail">
        <h4 className="header">{fullname}</h4>
        <p className="paragraph">{address1}</p>
        {address2 && <p className="paragraph">{address2}</p>}
        <p className="paragraph">{city}</p>
        <p className="paragraph">{zipCode}</p>
        <p className="paragraph">{phone}</p>
      </div>
      <Button
        onClick={() => {
          window.localStorage.setItem(address_key, JSON.stringify(address));
          history.push('/buy/checkout');
        }}
        width="100%"
        className="btn--orange"
        style={{ margin: '1rem 0' }}
      >
        Deliver to this address
      </Button>
      <div className="shipping-address__edit">
        <FontAwesomeIcon
          icon={['fas', 'edit']}
          size="1x"
          style={{ cursor: 'pointer' }}
          onClick={() => setAddressToEdit(address)}
        />
        <FontAwesomeIcon
          icon={['fas', 'trash-alt']}
          color="red"
          size="1x"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setAddressToDelete(address);
            setOpenDialog(true);
          }}
        />
      </div>
    </div>
  );
};

export default ShippingAddress;
