import React, { FC } from 'react';
import DialogWrapper from './DialogWrapper';
import Button from '../Button/Button';

interface Props {
  header: string;
  message: string;
  //   onOpenDialog?: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  confirmText?: string;
}

const AlertDialog: FC<Props> = ({
  header,
  message,
  onCancel,
  onConfirm,
  loading,
  error,
  confirmText,
}) => {
  return (
    <DialogWrapper
      header={header}
      onClose={onCancel && !loading ? onCancel : undefined}
    >
      <div className="dialog-body">
        <div className="alert-message paragraph paragraph--success">
          {message}
        </div>
        <div className="alert-action">
          {onCancel && (
            <Button
              disabled={loading}
              className="btn--cancel"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          {onConfirm && (
            <Button
              onClick={() => onConfirm()}
              loading={loading}
              disabled={loading}
              className="btn--confirm"
            >
              {confirmText ? confirmText : 'Confirm'}
            </Button>
          )}
        </div>
        {error && <p className="paragraph paragraph--error">{error}</p>}
      </div>
    </DialogWrapper>
  );
};

export default AlertDialog;
