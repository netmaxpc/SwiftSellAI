
import React from 'react';

export enum AppState {
  IDLE,
  REVIEW,
  LISTING,
  COMPLETE,
}

export interface ItemData {
  title: string;
  description: string;
  price: number;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Platform {
  id: string;
  name: string;
  logo: (props: { className?: string }) => React.ReactElement;
  requiresConnection?: boolean;
}
