import React, { memo, useState, useEffect } from 'react';

import { fetchContentTypes } from '../../utils/api';

import ContentTypesTable from '../../components/ContentTypesTable';

import { Box } from '@strapi/design-system';
import { Page, useAuth } from '@strapi/strapi/admin';
import { Layouts } from "@strapi/admin/strapi-admin";

const HomePage = () => {
  const [contentTypes, setContentTypes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuth('VotingHomePage', (state) => state.token);

  useEffect(() => {
    if (!token) {
      return;
    }
    (async () => {
      const fetchedContentTypes = await fetchContentTypes(token);
      setContentTypes(fetchedContentTypes || {});
      setIsLoading(false);
    })();
  }, [token]);

  console.log('contentTypes', contentTypes);

  if (isLoading) {
    return <Page.Loading />;
  }

  return (
    <>
      <Box background="neutral100">
        <Layouts.BaseHeader
          title="Voting"
          subtitle="Add simple voting system to any collection type"
          as="h2"
        />
      </Box>

      <ContentTypesTable contentTypes={contentTypes} />
    </>
  );
};

export default memo(HomePage);
