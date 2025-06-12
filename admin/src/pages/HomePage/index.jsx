import React, { memo, useState, useEffect } from 'react';

import { fetchContentTypes } from '../../utils/api';

import ContentTypesTable from '../../components/ContentTypesTable';

import { Box } from '@strapi/design-system';
import { Page } from "@strapi/strapi/admin";
import { Layouts } from "@strapi/admin/strapi-admin";

const HomePage = () => {
  const [contentTypes, setContentTypes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const fetchedContentTypes = await fetchContentTypes();
      setContentTypes(fetchedContentTypes);
      setIsLoading(false);
    })();
  }, []);

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
