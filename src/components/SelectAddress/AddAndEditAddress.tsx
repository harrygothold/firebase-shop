import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useManageShippingAddress } from '../../hooks/useManageShippingAddress';
import { Address, UserInfo } from '../../types';
import Button from '../Button/Button';
import Input from '../Input/Input';

interface Props {
  userInfo: UserInfo | null;
  addressToEdit: Address | null;
  setAddressToEdit: (address: Address | null) => void;
}

const AddAndEditAddress: FC<Props> = ({
  userInfo,
  addressToEdit,
  setAddressToEdit,
}) => {
  const { register, errors, handleSubmit, reset } = useForm<
    Omit<Address, 'index'>
  >();
  const {
    addNewAddress,
    editAddress,
    loading,
    error,
  } = useManageShippingAddress();

  const handleAddNewAddress = handleSubmit(async (data) => {
    if (!userInfo) return;
    const finished = await addNewAddress(data, userInfo);
    if (finished) {
      reset();
    }
  });

  const handleEditAddress = handleSubmit(async (data) => {
    if (!userInfo?.shippingAddresses || addressToEdit?.index === undefined)
      return;
    if (typeof addressToEdit.index !== 'number') return;
    const {
      fullname,
      address1,
      address2,
      city,
      zipCode,
      phone,
    } = addressToEdit;
    if (
      fullname === data.fullname &&
      address1 !== data.address1 &&
      address2 === data.address2 &&
      city === data.city &&
      zipCode === data.zipCode &&
      phone === data.phone
    ) {
      alert('No changes have been made');
      return;
    }
    const finished = await editAddress(data, addressToEdit.index, userInfo);
    if (finished) {
      reset();
      setAddressToEdit(null);
    }
  });

  return (
    <form
      className="form"
      onSubmit={addressToEdit ? handleEditAddress : handleAddNewAddress}
      style={{ width: '100%' }}
    >
      <p
        className="paragraph paragraph--success paragraph--focus"
        style={{ cursor: 'pointer', textAlign: 'end', marginRight: '0.5rem' }}
        onClick={() => {
          reset();
          setAddressToEdit(null);
        }}
      >
        Clear All
      </p>
      <Input
        label="Full Name"
        name="fullname"
        placeholder="Full Name"
        ref={register({ required: 'Full name is required' })}
        error={errors.fullname?.message}
        defaultValue={addressToEdit ? addressToEdit?.fullname : ''}
      />
      <Input
        label="Address 1"
        name="address1"
        placeholder="Address 1"
        ref={register({ required: 'Address 1 is required' })}
        error={errors.address1?.message}
        defaultValue={addressToEdit ? addressToEdit?.address1 : ''}
      />
      <Input
        label="Address 2"
        name="address2"
        placeholder="Address 2"
        ref={register}
        defaultValue={addressToEdit ? addressToEdit?.address2 : ''}
      />
      <Input
        label="City"
        name="city"
        placeholder="City"
        ref={register({ required: 'City is required' })}
        defaultValue={addressToEdit ? addressToEdit?.city : ''}
        error={errors.city?.message}
      />
      <Input
        label="Zip Code"
        name="zipCode"
        placeholder="Zip Code"
        ref={register({ required: 'Zip Code is required' })}
        defaultValue={addressToEdit ? addressToEdit?.zipCode : ''}
        error={errors.zipCode?.message}
      />
      <Input
        label="Phone"
        name="phone"
        placeholder="Phone Number"
        ref={register({ required: 'Phone number is required' })}
        error={errors.phone?.message}
        defaultValue={addressToEdit ? addressToEdit?.phone : ''}
      />
      <Button loading={loading} disabled={loading} type="submit" width="100%">
        Submit
      </Button>
      {error && <p className="paragraph paragraph--error">{error}</p>}
    </form>
  );
};

export default AddAndEditAddress;
