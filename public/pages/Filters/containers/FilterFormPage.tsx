/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  EuiButtonIcon,
  EuiCompressedFieldText,
  EuiCompressedFormRow,
  EuiCompressedSelect,
  EuiCompressedSwitch,
  EuiCompressedTextArea,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
  EuiPopover,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { FormFieldArray } from '../../../components/FormFieldArray';
import { Form, Formik, FormikErrors } from 'formik';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import FormFieldHeader from '../../../components/FormFieldHeader';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { DataStore } from '../../../store/DataStore';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import {
  errorNotificationToast,
  setBreadcrumbs,
  successNotificationToast,
} from '../../../utils/helpers';
import { useSpaceSelector } from '../../../hooks/useSpaceSelector';
import { FILTER_NAME_REGEX } from '../../../utils/validation';
import {
  FilterFormModel,
  filterFormDefaultValue,
  mapFilterToForm,
  mapFormToFilterResource,
} from '../utils/mappers';
import { FILTER_TYPE_OPTIONS } from '../utils/constants';

const FILTER_ACTION = {
  CREATE: 'create',
  EDIT: 'edit',
} as const;
type FilterAction = typeof FILTER_ACTION[keyof typeof FILTER_ACTION];

const actionLabels: Record<FilterAction, string> = {
  create: 'Create',
  edit: 'Edit',
};

type FilterFormPageProps = {
  notifications: NotificationsStart;
  history: RouteComponentProps['history'];
  action: FilterAction;
  match: { params: { id?: string } };
};

export const FilterFormPage: React.FC<FilterFormPageProps> = ({
  notifications,
  history,
  action,
  match,
}) => {
  const filterId = match.params.id;
  const [isLoading, setIsLoading] = useState(false);
  const [initialValue, setInitialValue] = useState<FilterFormModel>(filterFormDefaultValue);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const { spaceFilter } = useSpaceSelector();

  // load existing filter when editing
  useEffect(() => {
    if (action === FILTER_ACTION.CREATE) {
      setBreadcrumbs([BREADCRUMBS.FILTERS, BREADCRUMBS.FILTERS_CREATE]);
      return;
    }
    if (!filterId) return;
    const fetchFilter = async () => {
      setIsLoading(true);
      try {
        const item = await DataStore.filters.getFilter(filterId);
        if (item?.document) {
          setInitialValue(mapFilterToForm(item.document));
        }
        setBreadcrumbs([
          BREADCRUMBS.FILTERS,
          BREADCRUMBS.FILTERS_EDIT,
          { text: item?.document?.name || filterId },
        ]);
      } catch {
        errorNotificationToast(
          notifications,
          'retrieve',
          'filter',
          `Could not retrieve filter ${filterId}.`
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilter();
  }, [action, filterId, notifications]);

  const validateForm = useCallback((values: FilterFormModel): FormikErrors<FilterFormModel> => {
    const errors: FormikErrors<FilterFormModel> = {};
    const trimmedName = values.name.trim();
    if (!trimmedName) {
      errors.name = 'Name is required';
    } else if (!FILTER_NAME_REGEX.test(trimmedName)) {
      errors.name = 'Must follow the pattern filter/<name>/<version> (e.g. filter/prefilter/0).';
    }
    if (!values.type) errors.type = 'Type is required';
    if (!values.check.trim()) errors.check = 'Check expression is required';
    if (!values.author.trim()) errors.author = 'Author is required';
    return errors;
  }, []);

  const handleSubmitForm = useCallback(
    async (values: FilterFormModel, { setSubmitting }: { setSubmitting: (v: boolean) => void }) => {
      const resource = mapFormToFilterResource(values);
      const space = spaceFilter || 'draft';
      try {
        if (action === FILTER_ACTION.CREATE) {
          const result = await DataStore.filters.createFilter({
            space,
            resource,
          });
          if (result) {
            successNotificationToast(notifications, 'created', 'filter', result.message);
            history.push(ROUTES.FILTERS);
          }
        } else if (filterId) {
          const result = await DataStore.filters.updateFilter(filterId, {
            space,
            resource,
          });
          if (result) {
            successNotificationToast(notifications, 'updated', 'filter', result.message);
            history.push(ROUTES.FILTERS);
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
    [action, filterId, spaceFilter, notifications, history]
  );

  const isSubmitDisabled = (errors: FormikErrors<FilterFormModel>) =>
    !!(errors.name || errors.type || errors.check || errors.author);

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
          key={filterId || 'new-filter'}
          initialValues={initialValue}
          validateOnMount
          enableReinitialize
          validate={validateForm}
          onSubmit={handleSubmitForm}
        >
          {({
            values,
            errors,
            touched,
            isSubmitting,
            setFieldValue,
            setFieldTouched,
            handleSubmit: formikSubmit,
          }) => (
            <Form>
              <EuiPanel>
                <PageHeader appDescriptionControls={false as any}>
                  <EuiText size="s">
                    <h1>{actionLabels[action]} filter</h1>
                  </EuiText>
                  <EuiText size="s" color="subdued">
                    {action === FILTER_ACTION.CREATE
                      ? <>Create a new event filter in the <strong>{spaceFilter || 'draft'}</strong> space.</>
                      : <>Edit the filter configuration in the <strong>{spaceFilter || 'draft'}</strong> space.</>}
                  </EuiText>
                  <EuiSpacer />
                </PageHeader>

                <EuiCompressedFormRow
                  label={'Name'}
                  fullWidth
                  isInvalid={!!errors.name && touched.name}
                  error={errors.name}
                  helpText={
                    !(errors.name && touched.name)
                      ? 'Must follow the pattern filter/<name>/<version> (e.g. filter/prefilter/0)'
                      : undefined
                  }
                >
                  <EuiCompressedFieldText
                    placeholder="filter/prefilter/0"
                    value={values.name}
                    onChange={(e) => setFieldValue('name', e.target.value)}
                    onBlur={() => setFieldTouched('name')}
                    isInvalid={!!errors.name && touched.name}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />

                <EuiCompressedFormRow
                  label={
                    <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                      <EuiFlexItem grow={false}>Type</EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiPopover
                          button={
                            <EuiButtonIcon
                              iconType="iInCircle"
                              aria-label="Filter type information"
                              onClick={() => setTypePopoverOpen(!typePopoverOpen)}
                              color="primary"
                              size="xs"
                            />
                          }
                          isOpen={typePopoverOpen}
                          closePopover={() => setTypePopoverOpen(false)}
                          anchorPosition="downRight"
                        >
                          <div style={{ width: '300px' }}>
                            <EuiText size="s">
                              <strong>Filter types</strong>
                            </EuiText>
                            <EuiSpacer size="s" />
                            <div style={{ paddingLeft: '16px' }}>
                              <EuiText size="xs">
                                <p>
                                  <strong>Pre-filter:</strong> Processed before input is passed to the space decoder tree.
                                </p>
                              </EuiText>
                              <EuiSpacer size="s" />
                              <EuiText size="xs">
                                <p>
                                  <strong>Post-filter:</strong> Processed after event is normalized by the space decoder tree, and enriched.
                                </p>
                              </EuiText>
                            </div>
                          </div>
                        </EuiPopover>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  }
                  fullWidth
                  isInvalid={!!errors.type && touched.type}
                  error={errors.type}
                >
                  <EuiCompressedSelect
                    options={FILTER_TYPE_OPTIONS}
                    value={values.type}
                    onChange={(e) => setFieldValue('type', e.target.value)}
                    onBlur={() => setFieldTouched('type')}
                    isInvalid={!!errors.type && touched.type}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />

                <EuiCompressedFormRow
                  label={'Check expression'}
                  fullWidth
                  isInvalid={!!errors.check && touched.check}
                  error={errors.check}
                  helpText="Expression evaluated to determine if the filter applies (e.g. $host.os.platform == 'ubuntu')"
                >
                  <EuiCompressedTextArea
                    placeholder="$host.os.platform == 'ubuntu'"
                    value={values.check}
                    onChange={(e) => setFieldValue('check', e.target.value)}
                    onBlur={() => setFieldTouched('check')}
                    isInvalid={!!errors.check && touched.check}
                    rows={3}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />

                <EuiCompressedFormRow label={'Enabled'} fullWidth>
                  <EuiCompressedSwitch
                    label={values.enabled ? 'Enabled' : 'Disabled'}
                    checked={values.enabled}
                    onChange={(e) => setFieldValue('enabled', e.target.checked)}
                  />
                </EuiCompressedFormRow>

                <EuiSpacer size="l" />

                <EuiCompressedFormRow
                  label={'Author'}
                  fullWidth
                  isInvalid={!!errors.author && touched.author}
                  error={errors.author}
                >
                  <EuiCompressedFieldText
                    placeholder="Enter author name"
                    value={values.author}
                    onChange={(e) => setFieldValue('author', e.target.value)}
                    onBlur={() => setFieldTouched('author')}
                    isInvalid={!!errors.author && touched.author}
                  />
                </EuiCompressedFormRow>
                
                <EuiSpacer size="m" />

                <EuiCompressedFormRow
                  label={
                    <>
                      {'Description - '}
                      <em>optional</em>
                    </>
                  }
                  fullWidth
                >
                  <EuiCompressedTextArea
                    placeholder="Brief description of what this filter does"
                    value={values.description}
                    onChange={(e) => setFieldValue('description', e.target.value)}
                    rows={2}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />

                <EuiCompressedFormRow
                  label={
                    <>
                      {'Documentation - '}
                      <em>optional</em>
                    </>
                  }
                  fullWidth
                >
                  <EuiCompressedFieldText
                    placeholder="Enter documentation URL"
                    value={values.documentation}
                    onChange={(e) => setFieldValue('documentation', e.target.value)}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer size="m" />

                <FormFieldArray
                  label={
                    <>
                      {'References - '}
                      <em>optional</em>
                    </>
                  }
                  values={values.references}
                  placeholder="https://example.com/reference"
                  addButtonLabel="Add reference"
                  onChange={(references) => setFieldValue('references', references)}
                />

                <FormFieldArray
                  label={
                    <>
                      {'Supports - '}
                      <em>optional</em>
                    </>
                  }
                  values={values.supports}
                  addButtonLabel="Add support"
                  onChange={(supports) => setFieldValue('supports', supports)}
                />
              </EuiPanel>

              <EuiSpacer size="xl" />
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiSmallButton href={`#${ROUTES.FILTERS}`}>Cancel</EuiSmallButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip
                    content={
                      isSubmitDisabled(errors) ? 'Please fill in all required fields' : undefined
                    }
                    position="top"
                  >
                    <EuiSmallButton
                      fill
                      disabled={isSubmitDisabled(errors)}
                      isLoading={isSubmitting}
                      onClick={() => formikSubmit()}
                    >
                      {actionLabels[action]} filter
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
