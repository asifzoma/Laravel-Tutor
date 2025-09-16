import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const BrainIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 8.5C12 8.5 12 5.5 14 4.5C16 3.5 17 5.5 17 5.5C17 5.5 18.5 4.5 19.5 5.5C20.5 6.5 19.5 8.5 19.5 8.5M12 8.5C12 8.5 12 5.5 10 4.5C8 3.5 7 5.5 7 5.5C7 5.5 5.5 4.5 4.5 5.5C3.5 6.5 4.5 8.5 4.5 8.5M12 8.5V13.5M12 13.5C12 15 10 16.5 8.5 16.5C7 16.5 5.5 15.5 5.5 15.5C4.5 15.5 3.5 16 3.5 17C3.5 18 4.5 18.5 5.5 18.5C6.5 18.5 8.5 19.5 10 18C11.5 16.5 12 15 12 13.5ZM12 13.5C12 15 14 16.5 15.5 16.5C17 16.5 18.5 15.5 18.5 15.5C19.5 15.5 20.5 16 20.5 17C20.5 18 19.5 18.5 18.5 18.5C17.5 18.5 15.5 19.5 14 18C12.5 16.5 12 15 12 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);