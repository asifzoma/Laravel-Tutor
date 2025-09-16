import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const TrophyIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1 1.026-4.335A7.5 7.5 0 0 1 12 6.75a7.5 7.5 0 0 1 3.474 7.665A9.75 9.75 0 0 1 16.5 18.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5v-.75a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 .75.75v.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h6" />
    </svg>
);