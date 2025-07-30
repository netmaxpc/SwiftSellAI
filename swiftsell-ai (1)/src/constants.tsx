import React from 'react';
import { Platform } from './types';

export const ShopifyLogo: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} viewBox="0 0 81 94" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M40.5 0C18.133 0 0 18.133 0 40.5S18.133 81 40.5 81c22.368 0 40.5-18.133 40.5-40.5S62.868 0 40.5 0Zm19.605 52.82c-1.215 3.645-4.131 6.156-7.857 6.156-4.59 0-7.857-3.024-7.857-7.614v-22.95h5.589v10.395c0 1.944.972 3.168 2.547 3.168s2.547-1.224 2.547-3.168V28.412h5.589v24.408ZM30.33 39.062c0-4.59 3.267-7.614 7.857-7.614 4.59 0 7.857 3.024 7.857 7.614v3.168H30.33v-3.168Zm15.714 6.156H30.33v7.614h15.714v-7.614Z" fill="#95BF47"/>
    <path d="M50.49 93.614H30.51L0 40.5 30.51 0h19.98L81 40.5 50.49 93.614Z" fill="#5E8E3E" stroke="#fff" strokeWidth="3"/>
  </svg>
);

export const FacebookLogo: React.FC<{className?: string; fill?: string}> = ({className, fill = "currentColor"}) => (
  <svg className={className} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12Z"/>
  </svg>
);

export const EbayLogo: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} viewBox="0 0 96 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.57.48H.92v39.04h42.1V28.1H21.57V.48z" fill="#E53238"/>
    <path d="M95.08.48H74.43v39.04h42.1V28.1H95.08V.48z" fill="#0064D3" transform="translate(-21.57)"/>
    <path d="M69.73.48H49.08v39.04h42.1V28.1H69.73V.48z" fill="#F5AF02" transform="translate(-14.4)"/>
    <path d="M48.2.48h-21.6v39.04h42.1V28.1H48.2V.48z" fill="#86B817" transform="translate(-7.17)"/>
  </svg>
);

export const PLATFORMS: Platform[] = [
  { id: 'shopify', name: 'Shopify', logo: (props) => <ShopifyLogo {...props} />, requiresConnection: true },
  { id: 'facebook', name: 'Facebook Marketplace', logo: (props) => <FacebookLogo {...props} fill="#1877F2" /> },
  { id: 'ebay', name: 'eBay', logo: (props) => <EbayLogo {...props} /> },
];
