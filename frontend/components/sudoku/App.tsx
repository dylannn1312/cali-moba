import React from 'react';
import { SudokuGame } from './Game';
import './App.css';
import { SudokuProvider } from './context/SudokuContext';

/**
 * App is the root React component.
 */
export const App: React.FC<{}> = () => {
  return (
    <SudokuProvider>
      <SudokuGame />
    </SudokuProvider>
  );
}
