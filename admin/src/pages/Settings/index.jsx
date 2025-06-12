import React, { memo, useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
// Api
import { fetchContentTypes } from '../../utils/api';
// Config
import { QueryClient, QueryClientProvider } from 'react-query';
import useConfig from '../../hooks/useConfig';
import { Formik } from 'formik';
// import { useOverlayBlocker, useAutoReloadOverlayBlocker } from "@strapi/helper-plugin";
import { Form } from '@strapi/strapi/admin';
import { useNotification } from '@strapi/strapi/admin';

import _ from 'lodash';
import {
  Accordion,
  Main,
  Button,
  Checkbox,
  Box,
  Flex,
  Field,
  Typography,
  Grid,
  SingleSelect, SingleSelectOption,
  Tooltip,
  DateTimePicker,
} from '@strapi/design-system';
import { Layouts } from "@strapi/admin/strapi-admin";
import { useAuth } from '@strapi/strapi/admin';
import { Check, Information, ArrowClockwise, Play } from '@strapi/icons';

import { RestartAlert } from '../../components/RestartAlert/styles';
import ConfirmationDialog from '../../components/ConfirmationDialog';

import { Page } from "@strapi/strapi/admin";

const queryClient = new QueryClient();

const _Settings = () => {
  const [restoreConfirmationVisible, setRestoreConfirmationVisible] = useState(false);
  const [restartRequired, setRestartRequired] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);

  const { toggleNotification } = useNotification();
  // const { lockApp, unlockApp } = useOverlayBlocker();
  // const { lockAppWithAutoreload, unlockAppWithAutoreload } = useAutoReloadOverlayBlocker();
  const token = useAuth('VotingSettings', (state) => state.token);
  const { fetch, restartMutation, submitMutation, restoreMutation } = useConfig(toggleNotification, token);
  const { data: configData, isLoading: isConfigLoading, err: configErr } = fetch;
  const { data: allCollectionsData, isLoading: areCollectionsLoading, err: collectionsErr } = useQuery(
    'get-all-content-types',
    () => fetchContentTypes(token)
  );

  const isLoading = isConfigLoading || areCollectionsLoading;
  const isError = configErr || collectionsErr;

  const preparePayload = ({ enabledCollections, votingPeriods, entryLabel, googleRecaptcha, confirmationToken, ...rest }) => {
    const payload = {
      ...rest,
      enabledCollections: enabledCollections,
      entryLabel: {
        ...Object.keys(entryLabel).reduce((prev, curr) => ({
          ...prev,
          [curr]: enabledCollections.includes(curr) ? entryLabel[curr] : undefined,
        }), {}),
        '*': entryLabel['*'],
      },
      googleRecaptcha: {
        ...Object.keys(googleRecaptcha).reduce((prev, curr) => ({
          ...prev,
          [curr]: enabledCollections.includes(curr) ? googleRecaptcha[curr] : undefined,
        }), {}),
        '*': googleRecaptcha['*'],
      },
      confirmationToken: {
        ...Object.keys(confirmationToken).reduce((prev, curr) => ({
          ...prev,
          [curr]: enabledCollections.includes(curr) ? confirmationToken[curr] : undefined,
        }), {}),
        '*': confirmationToken['*'],
      },
      votingPeriods: {
        ...Object.keys(votingPeriods).reduce((prev, curr) => ({
          ...prev,
          [curr]: enabledCollections.includes(curr) ? votingPeriods[curr] : undefined,
        }), {})
      },
    };
    console.log('PREPARED PAYLOAD', payload);
    return payload;
  };

  if (isLoading || isError) {
    return (<Page.Loading>..Loading..</Page.Loading>);
  }

  const REGEX = {
    uid: "/^(?<type>[a-z0-9-]+)\:{2}(?<api>[a-z0-9-]+)\.{1}(?<contentType>[a-z0-9-]+)$/i",
    relatedUid: "/^(?<uid>[a-z0-9-]+\:{2}[a-z0-9-]+\.[a-z0-9-]+)\:{1}(?<id>[a-z0-9-]+)$/i",
    email: "/\S+@\S+\.\S+/",
    sorting: "/^(?<path>[a-z0-9-_\:\.]+)\:+(asc|desc)$/i"
  };

  const parseRegExp = (regexpString) => {
    const [value, flags] = regexpString.split('/').filter(_ => _.length > 0);
    return {
      value,
      flags,
    };
  };

  const regexUID = !isLoading ? new RegExp(
    parseRegExp(REGEX.uid).value,
    parseRegExp(REGEX.uid).flags
  ) : null;

  const allCollections = !isLoading && allCollectionsData && allCollectionsData.collectionTypes
    .filter(({ uid }) => _.first(uid.split(regexUID).filter(s => s && s.length > 0)) === 'api');

  const enabledCollections = configData.enabledCollections && !_.isEmpty(configData.enabledCollections) ? configData.enabledCollections
    .map(uid => allCollections.find(_ => _.uid === uid) ? uid : undefined)
    .filter(_ => _) : []

  const entryLabel = configData.entryLabel || {};
  const votingPeriods = configData.votingPeriods || {};
  const googleRecaptcha = configData.googleRecaptcha || {};
  const confirmationToken = configData.confirmationToken || {};

  const handleUpdateConfiguration = async (form) => {

    // lockApp();

    const payload = preparePayload(form);
    await submitMutation.mutateAsync(payload);
    const enabledCollectionsChanged = !_.isEqual(payload.enabledCollections, configData?.enabledCollections);
    const votingPeriodsChanged = !_.isEqual(payload.votingPeriods, configData?.votingPeriods);
    const googleRecaptchaChanged = !_.isEqual(payload.googleRecaptcha, configData?.googleRecaptcha);
    const confirmationTokenChanged = !_.isEqual(payload.confirmationToken, configData?.confirmationToken);

    if (enabledCollectionsChanged || votingPeriodsChanged || googleRecaptchaChanged || confirmationTokenChanged) {
      setRestartRequired(true);
    }

    // unlockApp();
  };

  const handleRestoreConfirmation = () => setRestoreConfirmationVisible(true);
  const handleRestoreConfiguration = async () => {
    // lockApp();
    await restoreMutation.mutateAsync();
    // unlockApp();
    setRestartRequired(true);
    setRestoreConfirmationVisible(false);
  };
  const handleRestoreCancel = () => setRestoreConfirmationVisible(false);

  const handleRestart = async () => {
    // lockAppWithAutoreload();
    await restartMutation.mutateAsync();
    setRestartRequired(false);
    // unlockAppWithAutoreload();
  };

  const handleRestartDiscard = () => setRestartRequired(false);

  const getCollectionField = (collection, field) => {
    const contentType = allCollections.filter(_ => _.uid === collection).pop()
    return contentType[field] || ''
  }

  const handleSetAvailableFields = (attributes) => {
    const attributeKeys = Object.keys(attributes);
    if (_.isEmpty(attributeKeys)) {
      setAvailableFields([]);
    };
    setAvailableFields(attributeKeys
      .map((key) => {
        const y = attributes[key];
        y.name = key;
        return y;
      })
      .filter(item => item.type === 'integer'));
  };

  const changeEntryLabelFor = (uid, current, value) => {
    const temp = {
      ...current,
      [uid]: value && !_.isEmpty(value) ? value : undefined,
    };
    return temp;
  };

  const changeRecaptchaFor = (uid, current, value) => {
    const temp = {
      ...current,
      [uid]: value ? value : false,
    };
    return temp;
  };

  const changeConfirmationTokenFor = (uid, current, value) => {
    const temp = {
      ...current,
      [uid]: value ? value : false,
    };
    return temp;
  };

  const changeVotingPeriodFor = (uid, current, value, type) => {
    const dateObj = current[uid] || {};
    const date = value;
    if (type === 'start') {
      dateObj.start = date;
    } else if (type === 'end') {
      dateObj.end = date;
    };
    const temp = {
      ...current,
      [uid]: dateObj,
    };
    return temp;
  };

  const boxDefaultProps = {
    width: '100%',
    background: "neutral0",
    hasRadius: true,
    shadow: "filterShadow",
    padding: 6,
  };

  return (
    <Main>
      <Formik
        initialValues={{
          enabledCollections,
          entryLabel,
          votingPeriods,
          googleRecaptcha,
          confirmationToken
        }}
        enableReinitialize={true}
        onSubmit={handleUpdateConfiguration}
      >
        {({ handleSubmit, setFieldValue, values }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Layouts.BaseHeader
              title="Voting"
              subtitle="Configure your voting plugin capabilities"
              primaryAction={
                <Button type="submit" startIcon={<Check />} loading={isLoading} disabled={restartRequired} >
                  Save
                </Button>
              }
            />
            <Layouts.Content>
              <Flex direction='column' gap={4}>
                {restartRequired && (
                  <RestartAlert
                    closeLabel="Cancel"
                    title="Restart is required"
                    action={<Box><Button onClick={handleRestart} startIcon={<Play />}>Restart now</Button></Box>}
                    onClose={handleRestartDiscard}>
                    You must restart mate
                  </RestartAlert>)}
                <Box {...boxDefaultProps}>
                  <Flex gap={4}>
                    <Typography variant="delta" as="h2">
                      General configuration
                    </Typography>
                    <Grid.Root gap={4}>
                      <Grid.Item col={12}>
                        <SingleSelect
                          id="enabledCollections-select"
                          onClear={() => setFieldValue('enabledCollections', [], false)}
                          clearLabel="Clear all collections"
                          value={values.enabledCollections}
                          onChange={(value) => setFieldValue('enabledCollections', value, false)}
                          multi
                          disabled={restartRequired}
                          name="enabledCollections"
                          label="Enable voting for"
                          placeholder="Select one or more collection"
                          hint="If none is selected, voting is disabled."
                          withTags
                        >
                          {
                            allCollectionsData &&
                              allCollectionsData.collectionTypes &&
                              !_.isEmpty(allCollectionsData.collectionTypes) ? (
                              allCollectionsData.collectionTypes.map((item) => (
                                <SingleSelectOption
                                  key={item.uid}
                                  value={item.uid}
                                >
                                  {item.globalId}
                                </SingleSelectOption>
                              ))
                            ) : ''
                          }
                        </SingleSelect>
                      </Grid.Item>
                      {values.enabledCollections && !_.isEmpty(values.enabledCollections) && (
                        <Grid.Item col={12}>
                          <Field.Root>
                            <Field.Label>
                              Custom settings per content type
                              <Tooltip description="Configure each collection types settings like voting field and voting duration.">
                                <Information aria-hidden={true} />
                              </Tooltip>
                            </Field.Label>
                            <Accordion.Root>
                              {
                                values.enabledCollections.map((collection) => {
                                  const key = `collectionSettings-${collection}`;
                                  const attributes = getCollectionField(collection, 'attributes');
                                  const attributeKeys = Object.keys(attributes);
                                  const availableFields = _.isEmpty(attributeKeys) ? [] : attributeKeys
                                    .map((key) => {
                                      const y = attributes[key];
                                      y.name = key;
                                      return y;
                                    })
                                    .filter(item => item.type === 'integer');
                                  return (
                                    <Accordion.Item
                                      key={key}
                                      value={key}
                                    >
                                      <Accordion.Header>
                                        <Accordion.Trigger>{getCollectionField(collection, 'globalId')}</Accordion.Trigger>
                                      </Accordion.Header>
                                      <Accordion.Content>
                                        <Box {...boxDefaultProps}>
                                          <Flex gap={4}>
                                            <Grid.Root gap={4}>
                                              <Grid.Item col={6}>
                                                <DateTimePicker
                                                  label={'Set voting start date'}
                                                  placeholder="Choose start date"
                                                  locale='en-HK'
                                                  hint={'If not set voting have already started.'}
                                                  onClear={() => setFieldValue('votingPeriods', changeVotingPeriodFor(collection, values.votingPeriods, null, 'start'))}
                                                  onChange={(value) => setFieldValue('votingPeriods', changeVotingPeriodFor(collection, values.votingPeriods, value, 'start'))}
                                                  value={values.votingPeriods[collection] && values.votingPeriods[collection].start ? new Date(values.votingPeriods[collection].start) : null}
                                                  clearLabel={'Clear'}
                                                  selectedDateLabel={formattedDate => `Voting start date set on ${formattedDate}`}
                                                  disabled={restartRequired}
                                                />
                                              </Grid.Item>
                                              <Grid.Item col={6}>
                                                <DateTimePicker
                                                  label={'Set voting end date'}
                                                  placeholder="Choose end date"
                                                  locale='en-HK'
                                                  hint={'If not set voting never ends.'}
                                                  onClear={() => setFieldValue('votingPeriods', changeVotingPeriodFor(collection, values.votingPeriods, null, 'end'))}
                                                  onChange={(value) => setFieldValue('votingPeriods', changeVotingPeriodFor(collection, values.votingPeriods, value, 'end'))}
                                                  value={values.votingPeriods[collection] && values.votingPeriods[collection].end ? new Date(values.votingPeriods[collection].end) : null}
                                                  clearLabel={'Clear'}
                                                  selectedDateLabel={formattedDate => `Voting end date set on ${formattedDate}`}
                                                  disabled={restartRequired}
                                                />
                                              </Grid.Item>
                                            </Grid.Root>
                                          </Flex>
                                        </Box>
                                        <Box {...boxDefaultProps}>
                                          <Flex gap={4}>
                                            <Grid.Root gap={4}>
                                              <Grid.Item col={4}>
                                                <SingleSelect
                                                  id="enabledFields-select"
                                                  clearLabel="Clear selected field."
                                                  value={values.entryLabel && values.entryLabel[collection] || []}
                                                  onChange={(value) => setFieldValue('entryLabel', changeEntryLabelFor(collection, values.entryLabel, value))}
                                                  onClear={() => setFieldValue('entryLabel', changeEntryLabelFor(collection, values.entryLabel))}
                                                  name="enabledFields"
                                                  label="Choose field to add votes to"
                                                  placeholder="votes"
                                                  hint="Defaults to 'votes' field if none is selected. Must be integer."
                                                  disabled={restartRequired}
                                                >
                                                  {
                                                    availableFields &&
                                                      !_.isEmpty(availableFields) ? (
                                                      availableFields
                                                        .map((item) => (
                                                          <SingleSelectOption
                                                            key={item.name}
                                                            value={item.name}
                                                          >
                                                            {item.name}
                                                          </SingleSelectOption>
                                                        ))
                                                    ) : ''
                                                  }
                                                </SingleSelect>
                                              </Grid.Item>
                                              {/* <Grid.Item col={4}>
                                                <Checkbox
                                                  label="Enable Google Recaptcha for the given collection"
                                                  hint="(Requires client/front side implementation)"
                                                  value={values.googleRecaptcha && values.googleRecaptcha[collection] || false}
                                                  onChange={(value) => setFieldValue('googleRecaptcha', changeRecaptchaFor(collection, values.googleRecaptcha, value.target.checked))}
                                                >
                                                  Google Recaptcha
                                                </Checkbox>
                                              </Grid.Item>
                                              <Grid.Item col={4}>
                                                <Checkbox
                                                  label="Enables email confirmation on form submit"
                                                  hint="Must set confirmationToken field for entries in content-type builder"
                                                  value={values.confirmationToken && values.confirmationToken[collection] || false}
                                                  onChange={(value) => setFieldValue('confirmationToken', changeConfirmationTokenFor(collection, values.confirmationToken, value.target.checked))}
                                                >
                                                  Send email confirmation
                                                </Checkbox>
                                              </Grid.Item> */}
                                            </Grid.Root>
                                          </Flex>
                                        </Box>
                                      </Accordion.Content>
                                    </Accordion.Item>
                                  )
                                })
                              }
                            </Accordion.Root>
                          </Field.Root>
                        </Grid.Item>
                      )}
                    </Grid.Root>
                  </Flex>
                </Box>
                <Box {...boxDefaultProps}>
                  <Flex gap={4} direction="column">
                    <Flex gap={2} direction="column">
                      <Typography variant="delta" as="h2">
                        Restore default settings
                      </Typography>
                      <Typography variant="pi" as="h4">
                        Discarding all of applied settings and getting back to plugin default ones. Use reasonably.
                      </Typography>
                    </Flex>
                    <ConfirmationDialog
                      isVisible={restoreConfirmationVisible}
                      isActionAsync={restoreMutation.isLoading}
                      header="Restore default configuration"
                      labelConfirm="Confirm"
                      iconConfirm={<ArrowClockwise />}
                      onConfirm={handleRestoreConfiguration}
                      onCancel={handleRestoreCancel}>
                      <p>You're about to restore plugin configuration to it default values. It might have destructive impact on already collected content. Do you really want to proceed?</p>
                    </ConfirmationDialog>
                  </Flex>
                </Box>
              </Flex>
            </Layouts.Content>
          </Form>
        )}
      </Formik>
    </Main>
  );
};

const Settings = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <_Settings />
    </QueryClientProvider>
  );
};

export default memo(Settings);
