/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Page } from '@strapi/strapi/admin';
import HomePage from '../HomePage';
import InnerPage from '../InnerPage';

const App = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path={`/:id`} element={<InnerPage />} exact />
      <Route path="*" element={<Page.Error />} />
    </Routes>
  );
};

export default App;
