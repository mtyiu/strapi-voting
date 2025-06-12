import React, { memo, useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { fetchCollection } from '../../utils/api';

import CollectionsTable from '../../components/CollectionsTable';

import { Box } from '@strapi/design-system';
import { Page, useAuth } from "@strapi/strapi/admin";
import { Layouts } from "@strapi/admin/strapi-admin";

const InnerPage = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuth('VotingInnerPage', (state) => state.token);

  useEffect(() => {
    if (!id || !token) {
      return;
    }
    (async () => {
      const fetchedItems = await fetchCollection(id, token);
      setItems(fetchedItems);
      setIsLoading(false);
    })();
  }, [id, token]);

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
