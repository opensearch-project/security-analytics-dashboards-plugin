/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EuiCompressedFieldText,
  EuiCompressedFormRow,
  EuiCompressedSwitch,
  EuiCompressedTextArea,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { Form, Formik, FormikErrors } from 'formik';
import { NotificationsStart } from 'opensearch-dashboards/public';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  IntegrationComboBox,
  useIntegrationSelector,
} from '../../../components/IntegrationComboBox';
import FormFieldHeader from '../../../components/FormFieldHeader';
import { FormFieldArray } from '../../../components/FormFieldArray';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { DataStore } from '../../../store/DataStore';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import {
  errorNotificationToast,
  setBreadcrumbs,
  successNotificationToast,
} from '../../../utils/helpers';
import { ContentEntry, KVDBContentEditor } from '../components/KVDBContentEditor';
import {
  kvdbFormDefaultValue,
  KVDBFormModel,
  mapFormToKVDBResource,
  mapKVDBToForm,
} from '../utils/mappers';

const KVDB_ACTION = {
  CREATE: 'create',
  EDIT: 'edit',
} as const;

type KVDBAction = typeof KVDB_ACTION[keyof typeof KVDB_ACTION];

const actionLabels: Record<KVDBAction, string> = {
  create: 'Create',
  edit: 'Edit',
};

type KVDBFormPageProps = {
  notifications: NotificationsStart;
  history: RouteComponentProps['history'];
  action: KVDBAction;
  match: { params: { id?: string } };
};

export const KVDBFormPage: React.FC<KVDBFormPageProps> = (props) => {
  const { notifications, history, action } = props;
  const kvdbId = props.match.params.id;
  const [isLoading, setIsLoading] = useState(false);
  const [integrationType, setIntegrationType] = useState<string>('');
  const [initialValue, setInitialValue] = useState<KVDBFormModel>(kvdbFormDefaultValue);

  const { loading: loadingIntegrations, options: integrationTypeOptions } = useIntegrationSelector({
    notifications,
    enabled: action === KVDB_ACTION.CREATE,
  });

  useEffect(() => {
    if (action !== KVDB_ACTION.EDIT) return;

    const fetchKVDB = async () => {
      setIsLoading(true);
      try {
        const item = await DataStore.kvdbs.getKVDB(kvdbId!);
        if (item?.document) {
          setInitialValue(mapKVDBToForm(item.document));
        }
        setBreadcrumbs([
          BREADCRUMBS.NORMALIZATION,
          BREADCRUMBS.KVDBS,
          BREADCRUMBS.KVDBS_EDIT,
          { text: item?.document?.title || kvdbId },
        ]);
      } catch {
        errorNotificationToast(
          notifications,
          'retrieve',
          'KVDB',
          `There was an error retrieving the KVDB with id ${kvdbId}.`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchKVDB();
  }, [action, kvdbId, notifications]);

  useEffect(() => {
    if (action !== KVDB_ACTION.CREATE) return;
    setBreadcrumbs([BREADCRUMBS.NORMALIZATION, BREADCRUMBS.KVDBS, BREADCRUMBS.KVDBS_CREATE]);
  }, [action]);

  const onIntegrationChange = useCallback((options: Array<{ id?: string }>) => {
    setIntegrationType(options[0]?.id || '');
  }, []);

  const createKVDB = useCallback(
    async (values: KVDBFormModel) => {
      const resource = mapFormToKVDBResource(values);
      const result = await DataStore.kvdbs.createKVDB({
        resource,
        integrationId: integrationType,
      });

      if (result) {
        successNotificationToast(
          notifications,
          KVDB_ACTION.CREATE,
          'KVDB',
          result.message || `The KVDB "${values.title}" has been created successfully.`
        );
        history.push(ROUTES.KVDBS);
      }
    },
    [integrationType, notifications, history]
  );

  const updateKVDB = useCallback(
    async (values: KVDBFormModel) => {
      if (!kvdbId) return;

      const resource = mapFormToKVDBResource(values);
      const result = await DataStore.kvdbs.updateKVDB(kvdbId, { resource });

      if (result) {
        successNotificationToast(
          notifications,
          'update',
          'KVDB',
          result.message || `The KVDB "${values.title}" has been updated successfully.`
        );
        history.push(ROUTES.KVDBS);
      }
    },
    [kvdbId, notifications, history]
  );

  const handleSubmit = useCallback(
    async (values: KVDBFormModel) => {
      if (action === KVDB_ACTION.CREATE) {
        await createKVDB(values);
      } else if (action === KVDB_ACTION.EDIT) {
        await updateKVDB(values);
      }
    },
    [action, createKVDB, updateKVDB]
  );

  const validateForm = useCallback((values: KVDBFormModel) => {
    const errors: FormikErrors<KVDBFormModel> = {};

    if (!values.title.trim()) {
      errors.title = 'Title is required';
    } else if (/\s/.test(values.title)) {
      errors.title = 'Title must not contain spaces';
    }

    if (!values.author.trim()) {
      errors.author = 'Author is required';
    }

    const keyCounts: Record<string, number> = {};
    values.contentEntries.forEach(({ key }) => {
      const k = key.trim();
      if (k) keyCounts[k] = (keyCounts[k] ?? 0) + 1;
    });

    const contentErrors = values.contentEntries.map(
      (entry): FormikErrors<ContentEntry> => {
        const entryErrors: FormikErrors<ContentEntry> = {};

        if (entry.key.trim() && keyCounts[entry.key.trim()] > 1) {
          entryErrors.key = 'Duplicate key';
        }

        const trimmed = entry.value.trim();
        if (trimmed[0] === '{' || trimmed[0] === '[') {
          try {
            JSON.parse(trimmed);
          } catch {
            entryErrors.value = 'Invalid JSON';
          }
        }

        return entryErrors;
      }
    );

    if (contentErrors.some((e) => Object.keys(e).length > 0)) {
      errors.contentEntries = contentErrors as any;
    }

    return errors;
  }, []);

  const handleSubmitForm = async (
    values: KVDBFormModel,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      await handleSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = (errors: FormikErrors<KVDBFormModel>) => {
    if (errors.title || errors.author) return true;
    if (action === KVDB_ACTION.CREATE && !integrationType) return true;
    return false;
  };

  const getSubmitTooltip = (errors: FormikErrors<KVDBFormModel>) => {
    const messages: string[] = [];
    if (action === KVDB_ACTION.CREATE && !integrationType) {
      messages.push('Select an integration to proceed');
    }
    if (errors.title || errors.author) {
      messages.push('Please fix the errors in the form to proceed');
    }
    return messages.length > 0 ? messages.join('. ') : undefined;
  };

  return (
    <>
      {isLoading ? (
        <EuiPanel>
          <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
            <EuiFlexItem grow={false}>
              <EuiLoadingSpinner size="xl" />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      ) : (
        <Formik
          key={kvdbId || 'new-kvdb'}
          initialValues={initialValue}
          validateOnMount={true}
          enableReinitialize={true}
          validate={validateForm}
          onSubmit={handleSubmitForm}
        >
          {(formikProps) => (
            <Form>
              <EuiPanel>
                <PageHeader appDescriptionControls={false}>
                  <EuiText size="s">
                    <h1>{actionLabels[action]} KVDB</h1>
                  </EuiText>
                  <EuiText size="s" color="subdued">
                    {action === KVDB_ACTION.CREATE
                      ? 'Create a new KVDB.'
                      : 'Edit the KVDB to update its configuration.'}
                  </EuiText>
                  <EuiSpacer />
                </PageHeader>
                {action === KVDB_ACTION.CREATE && (
                  <>
                    <IntegrationComboBox
                      options={integrationTypeOptions}
                      selectedId={integrationType}
                      isLoading={loadingIntegrations}
                      onChange={onIntegrationChange}
                      resourceName="KVDBs"
                    />
                    <EuiSpacer size="m" />
                  </>
                )}
                <EuiCompressedFormRow
                  label={<FormFieldHeader headerTitle={'Title'} />}
                  fullWidth={true}
                  isInvalid={!!formikProps.errors.title && formikProps.touched.title}
                  error={formikProps.errors.title}
                >
                  <EuiCompressedFieldText
                    placeholder="Enter KVDB title"
                    value={formikProps.values.title}
                    onChange={(e) => formikProps.setFieldValue('title', e.target.value)}
                    onBlur={() => formikProps.setFieldTouched('title')}
                    isInvalid={!!formikProps.errors.title && formikProps.touched.title}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />
                <EuiCompressedFormRow
                  label={<FormFieldHeader headerTitle={'Author'} />}
                  fullWidth={true}
                  isInvalid={!!formikProps.errors.author && formikProps.touched.author}
                  error={formikProps.errors.author}
                >
                  <EuiCompressedFieldText
                    placeholder="Enter author name"
                    value={formikProps.values.author}
                    onChange={(e) => formikProps.setFieldValue('author', e.target.value)}
                    onBlur={() => formikProps.setFieldTouched('author')}
                    isInvalid={!!formikProps.errors.author && formikProps.touched.author}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />
                <EuiCompressedFormRow
                  label={<FormFieldHeader headerTitle={'Description'} />}
                  fullWidth={true}
                >
                  <EuiCompressedTextArea
                    placeholder="Enter a description"
                    value={formikProps.values.description}
                    onChange={(e) => formikProps.setFieldValue('description', e.target.value)}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />
                <EuiCompressedFormRow
                  label={<FormFieldHeader headerTitle={'Documentation'} />}
                  fullWidth={true}
                >
                  <EuiCompressedFieldText
                    placeholder="Enter documentation URL"
                    value={formikProps.values.documentation}
                    onChange={(e) => formikProps.setFieldValue('documentation', e.target.value)}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />
                <FormFieldArray
                  label={<FormFieldHeader headerTitle={'References'} />}
                  values={formikProps.values.references}
                  placeholder="https://example.com/reference"
                  addButtonLabel="Add reference"
                  onChange={(references) => formikProps.setFieldValue('references', references)}
                />
                <EuiCompressedFormRow
                  label={<FormFieldHeader headerTitle={'Enabled'} />}
                  fullWidth={true}
                >
                  <EuiCompressedSwitch
                    label={formikProps.values.enabled ? 'Enabled' : 'Disabled'}
                    checked={formikProps.values.enabled}
                    onChange={(e) => formikProps.setFieldValue('enabled', e.target.checked)}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />
                <EuiCompressedFormRow
                  label={<FormFieldHeader headerTitle={'Content'} />}
                  fullWidth={true}
                >
                  <KVDBContentEditor />
                </EuiCompressedFormRow>
              </EuiPanel>
              <EuiSpacer size="xl" />
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiSmallButton href={`#${ROUTES.KVDBS}`}>Cancel</EuiSmallButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip content={getSubmitTooltip(formikProps.errors)} position="top">
                    <EuiSmallButton
                      disabled={isSubmitDisabled(formikProps.errors)}
                      isLoading={formikProps.isSubmitting}
                      onClick={() => formikProps.handleSubmit()}
                      fill
                    >
                      {actionLabels[action]} KVDB
                    </EuiSmallButton>
                  </EuiToolTip>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};
