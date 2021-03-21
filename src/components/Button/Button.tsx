import { ButtonHTMLAttributes, forwardRef, Ref } from 'react';
import Spinner from '../Spinner/Spinner';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  height?: string;
  width?: string;
  loading?: boolean;
  spinnerColor?: string;
  spinnerHeight?: number;
  spinnerWidth?: number;
}

const Button = forwardRef(
  (
    {
      children,
      height = '2.7rem',
      width = '9rem',
      loading,
      disabled,
      style,
      className,
      spinnerColor,
      spinnerHeight,
      spinnerWidth,
      ...props
    }: Props,
    ref: Ref<HTMLButtonElement>
  ) => {
    return (
      <button
        ref={ref}
        className={`btn ${className}`}
        disabled={disabled}
        {...props}
        style={{
          cursor: loading || disabled ? 'not-allowed' : 'pointer',
          height,
          width,
          ...style,
        }}
      >
        {loading ? (
          <Spinner
            color={spinnerColor}
            height={spinnerHeight}
            width={spinnerWidth}
          />
        ) : (
          children
        )}
      </button>
    );
  }
);

export default Button;
