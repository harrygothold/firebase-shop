import React, { FC } from 'react';

interface Props {
  header: string;
  onClose?: (open: boolean) => void;
}

const DialogWrapper: FC<Props> = ({ header, children, onClose }) => {
  return (
    <div>
      <div
        className="backdrop"
        onClick={onClose ? () => onClose(false) : undefined}
      ></div>
      <div className="modal modal--dialog">
        {onClose && (
          <div
            className="modal-close"
            onClick={onClose ? () => onClose(false) : undefined}
          >
            &times;
          </div>
        )}
        <h3 className="header">{header}</h3>
        <div className="dialog">{children}</div>
      </div>
    </div>
  );
};

export default DialogWrapper;
