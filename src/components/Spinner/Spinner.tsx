import React, { FC } from 'react';
import Loader from 'react-loader-spinner';

interface Props {
  color?: string;
  height?: number;
  width?: number;
}

const Spinner: FC<Props> = ({ color = 'white', width = 20, height = 20 }) => {
  return (
    <Loader
      type="Oval"
      height={height}
      width={width}
      timeout={20000}
      color={color}
    />
  );
};

export default Spinner;
