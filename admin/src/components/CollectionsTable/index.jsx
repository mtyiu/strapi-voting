/*
 *
 * HomePage
 *
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  LinkButton,
  IconButton,
  EmptyStateLayout,
  Flex,
  Table, Thead, Tbody, Tr, Td, Th
} from '@strapi/design-system';
import { Plus, CaretDown } from '@strapi/icons';
import _ from 'lodash';
// API
import { vote } from '../../utils/api';
const handleVoting = async (uid, id) => {
  await vote(uid, id)
  console.table([{ 'UID': uid, 'ID': id }])
}
const CollectionsTable = ({ items }) => {
  const { id } = useParams();
  return (
    items && !_.isEmpty(items) ? (
      <Box padding={8}>
        <Table colCount={2} rowCount={items?.length}>
          <Thead>
            <Tr>
              <Th action={<IconButton label="Sort on Name" noBorder><CaretDown /></IconButton>}>
                <Typography variant="sigma">Name</Typography>
              </Th>
              <Th action={<IconButton label="Sort on Votes" noBorder><CaretDown /></IconButton>}>
                <Typography variant="sigma">Votes</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((item) => (
              <Tr key={item.id}>
                <Td>
                  <Typography textColor="neutral800">
                    {item.title || item.name || item.test || item.titleTC || item.titleEN}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {item.votes}
                  </Typography>
                </Td>
                <Td>
                  <Flex justifyContent="right" alignItems="right">
                    <LinkButton onClick={() => handleVoting(id, item.documentId)}>
                      Vote!
                    </LinkButton>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>)
      : (<Box padding={8}>
        <EmptyStateLayout
          content="You don't have any items in this collection yet..."
          action={
            <LinkButton
              to="/plugins/content-type-builder"
              variant="secondary"
              startIcon={<Plus />}
            >
              Create your first collection-type
            </LinkButton>
          }
        />
      </Box>)
  );
};

export default CollectionsTable;
