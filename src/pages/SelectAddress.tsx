import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import AddAndEditAddress from '../components/SelectAddress/AddAndEditAddress';
import ShippingAddress from '../components/SelectAddress/ShippingAddress';
import AlertDialog from '../components/Dialogs/AlertDialog';
import Spinner from '../components/Spinner/Spinner';
import { useCartContext } from '../state/cart-context';
import { useManageShippingAddress } from '../hooks/useManageShippingAddress';
import { useDialog } from '../hooks/useDialog';
import { useAuthContext } from '../state/auth-context';
import { Address } from '../types';

interface Props {}

const SelectAddress: React.FC<Props> = () => {
  const { cart } = useCartContext();
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const { openDialog, setOpenDialog } = useDialog();
  const { deleteAddress, loading, error } = useManageShippingAddress();
  const {
    authState: { userInfo },
  } = useAuthContext();

  if (!cart || (cart && cart.length === 0)) return <Redirect to="/" />;

  if (!userInfo) return <Spinner color="grey" height={50} width={50} />;
  return (
    <div className="page--select-address">
      <h2 className="header">Select a Shipping Address</h2>
      <div className="select-address">
        <div className="select-address__existing">
          {userInfo?.shippingAddresses &&
          userInfo?.shippingAddresses?.length > 0 ? (
            userInfo?.shippingAddresses?.map((address, index: number) => (
              <ShippingAddress
                key={index}
                address={{ ...address, index }}
                setAddressToEdit={setAddressToEdit}
                setAddressToDelete={setAddressToDelete}
                setOpenDialog={setOpenDialog}
              />
            ))
          ) : (
            <p className="paragraph">Please add an address</p>
          )}
        </div>
        <div className="select-address__add-new">
          <h3 className="header">Add a New Address</h3>
          <AddAndEditAddress
            addressToEdit={addressToEdit}
            setAddressToEdit={setAddressToEdit}
            userInfo={userInfo}
          />
        </div>
      </div>
      {openDialog && (
        <AlertDialog
          header="Please confirm"
          message="Are you sure you want to delete this address?"
          loading={loading}
          error={error}
          onCancel={() => {
            setAddressToDelete(null);
            setOpenDialog(false);
          }}
          onConfirm={async () => {
            if (!userInfo || addressToDelete?.index === undefined) return;
            if (typeof addressToDelete.index !== 'number') return;
            const finished = await deleteAddress(
              addressToDelete.index,
              userInfo
            );
            if (finished) {
              setAddressToDelete(null);
              setOpenDialog(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default SelectAddress;
