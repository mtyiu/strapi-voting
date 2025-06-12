/*
 *
 * HomePage
 *
 */

import React from 'react';
import {
  Box,
  Typography,
  LinkButton,
  EmptyStateLayout,
  Flex,
  Table, Thead, Tbody, Tr, Td, Th
} from '@strapi/design-system';
import _ from 'lodash';
import { Plus } from '@strapi/icons';

const ContentTypesTable = ({ contentTypes }) => {
  return (
    <Box padding={8}>
      <Table colCount={2} rowCount={contentTypes.collectionTypes?.length}>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">Name</Typography>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {contentTypes &&
            contentTypes.collectionTypes &&
            !_.isEmpty(contentTypes.collectionTypes) ? (
            contentTypes.collectionTypes.map((item) => (
              <Tr key={item.uid}>
                <Td>
                  <Typography textColor="neutral800">
                    {item.globalId}
                  </Typography>
                </Td>
                <Td>
                  <Flex justifyContent="right" alignItems="right">
                    <LinkButton
                      href={`/admin/plugins/voting/${item.uid}`}
                    >
                      View Results
                    </LinkButton>
                  </Flex>
                </Td>
              </Tr>
            ))
          ) : (
            <Box padding={8} background="neutral0">
              <EmptyStateLayout
                content="You don't have any collection-types yet..."
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
            </Box>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ContentTypesTable;
