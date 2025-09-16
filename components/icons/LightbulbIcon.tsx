import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const LightbulbIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"></path>
       <path d="M9.7 17l4.6 0"></path>
    </svg>
);