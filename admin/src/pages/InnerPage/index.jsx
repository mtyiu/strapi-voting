import React, { memo, useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { fetchCollection } from '../../utils/api';

import CollectionsTable from '../../components/CollectionsTable';

import { Box } from '@strapi/design-system';
import { Page } from "@strapi/strapi/admin";
import { Layouts } from "@strapi/admin/strapi-admin";

const InnerPage = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const fetchedItems = await fetchCollection(id);
      setItems(fetchedItems);
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
        <CollectionsTable items={items} />
      </Box>
    </>
  );
};

export default memo(InnerPage);
