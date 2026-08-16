// src/components/common/HeartIcon.tsx

import React from "react";
import Svg, { Path } from "react-native-svg";

interface HeartIconProps {
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: any;
}

export const HeartIcon: React.FC<HeartIconProps> = ({ size = 24, color = "#000", fill = "none", strokeWidth = 2, style }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
};

export default HeartIcon;
