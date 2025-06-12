import React, { memo, useState, useEffect, useRef } from 'react';

import { fetchContentTypes } from '../../utils/api';

import ContentTypesTable from '../../components/ContentTypesTable';

import { Box } from '@strapi/design-system';
import { Page } from "@strapi/strapi/admin";
import { Layouts } from "@strapi/admin/strapi-admin";

const HomePage = () => {
  const contentTypes = useRef({});

  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    contentTypes.current = await fetchContentTypes(); // Here

    setIsLoading(false);
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

      <ContentTypesTable contentTypes={contentTypes.current} />
    </>
  );
};

export default memo(HomePage);
