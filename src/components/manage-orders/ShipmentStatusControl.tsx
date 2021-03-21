import { ChangeEvent, FC, useState } from 'react';
import { shipmentStatuses } from '../../helpers';
import { useUpdateShipmentStatus } from '../../hooks/useUpdateShipmentStatus';
import { Order, ShipmentStatus } from '../../types';
import Button from '../Button/Button';

interface Props {
  order: Order;
}

const ShipmentStatusControl: FC<Props> = ({ order }) => {
  const [newStatus, setNewStatus] = useState(order.shipmentStatus);
  const { loading, error, updateStatus } = useUpdateShipmentStatus();
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(e.target.value as ShipmentStatus);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    const updated = await updateStatus(order.id, newStatus);

    if (!updated && error) alert(error);
  };

  return (
    <div className="shipment-status">
      <select
        name="status"
        className="status-action"
        defaultValue={order.shipmentStatus}
        onChange={handleStatusChange}
      >
        {shipmentStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <Button
        onClick={handleUpdateStatus}
        disabled={loading || newStatus === order.shipmentStatus}
        loading={loading}
        width="40%"
        className="btn--orange"
      >
        Update
      </Button>
    </div>
  );
};

export default ShipmentStatusControl;
