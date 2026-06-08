/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonGroup,
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
  EuiSpacer,
  EuiText,
  EuiToolTip,
  EuiCodeEditor,
} from '@elastic/eui';
import { FormFieldArray } from '../../../components/FormFieldArray';
import { Form, Formik, FormikErrors } from 'formik';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
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
  filterYamlFormDefaultValue,
  mapFilterToForm,
  mapYamlToForm,
  mapFormToYaml,
  parseCheckYaml,
} from '../utils/mappers';
import { FILTER_TYPE_OPTIONS } from '../utils/constants';
import { YamlForm, YAML_TYPE, validateYamlSyntax } from '../../../components/YamlForm';

const FILTER_ACTION = {
  CREATE: 'create',
  EDIT: 'edit',
} as const;
type FilterAction = typeof FILTER_ACTION[keyof typeof FILTER_ACTION];

const actionLabels: Record<FilterAction, string> = {
  create: 'Create',
  edit: 'Edit',
};

const EDITOR_TYPE = {
  VISUAL: 'visual',
  YAML: 'yaml',
} as const;

type EditorType = typeof EDITOR_TYPE[keyof typeof EDITOR_TYPE];

const editorTypes: Array<{ id: EditorType; label: string }> = [
  { id: EDITOR_TYPE.VISUAL, label: 'Visual Editor' },
  { id: EDITOR_TYPE.YAML, label: 'YAML Editor' },
];

const isSubmitDisabled = (errors: FormikErrors<FilterFormModel>) =>
  !!(errors.name || errors.type || errors.check || errors.author);

type FilterFormPageProps = {
  notifications: NotificationsStart;
  history: RouteComponentProps['history'];
  action: FilterAction;
  match: { params: { id?: string } };
};

const checkHelpPreStyle: React.CSSProperties = { margin: '4px 0 0 0' };
const checkEditorOptions = { tabSize: 2, useSoftTabs: true, showPrintMargin: false };

const checkHelpText = (
  <div style={{ maxWidth: '600px' }}>
    Expression evaluated to determine if the filter applies (e.g.{' '}
    <code>$host.os.platform == 'ubuntu'</code>) or a list of field/value pairs:
    <pre style={checkHelpPreStyle}>{`- host.os.platform: ubuntu\n- host.os.type: linux`}</pre>
  </div>
);

export const FilterFormPage: React.FC<FilterFormPageProps> = ({
  notifications,
  history,
  action,
  match,
}) => {
  const filterId = match.params.id;
  const [isLoading, setIsLoading] = useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const { spaceFilter } = useSpaceSelector();
  const [selectedEditorType, setSelectedEditorType] = useState<EditorType>(EDITOR_TYPE.VISUAL);
  const [rawFilter, setRawFilter] = useState<string>(filterYamlFormDefaultValue);
  const [yamlErrors, setYamlErrors] = useState<string[] | null>(null);
  const [initialValue, setInitialValue] = useState<FilterFormModel>(filterFormDefaultValue);

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
          setInitialValue(mapYamlToForm(item.yaml) ?? mapFilterToForm(item.document));
          setRawFilter(item.yaml);
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
    const checkResult = parseCheckYaml(values.check);
    if (!checkResult.ok) errors.check = checkResult.error;
    if (!values.author.trim()) errors.author = 'Author is required';
    return errors;
  }, []);

  const handleSubmitForm = useCallback(
    async (values: FilterFormModel, { setSubmitting }: { setSubmitting: (v: boolean) => void }) => {
      const resourceYaml =
        selectedEditorType === EDITOR_TYPE.YAML && rawFilter ? rawFilter : mapFormToYaml(values);
      const space = spaceFilter || 'draft';
      try {
        if (action === FILTER_ACTION.CREATE) {
          const result = await DataStore.filters.createFilter({ resourceYaml, space });
          if (result) {
            successNotificationToast(notifications, 'created', 'filter', result.message);
            history.push(ROUTES.FILTERS);
          }
        } else if (filterId) {
          const result = await DataStore.filters.updateFilter(filterId, { resourceYaml, space });
          if (result) {
            successNotificationToast(notifications, 'updated', 'filter', result.message);
            history.push(ROUTES.FILTERS);
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
    [action, filterId, spaceFilter, notifications, history, selectedEditorType, rawFilter]
  );

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
            dirty,
            isSubmitting,
            setFieldValue,
            setFieldTouched,
            setValues,
            handleSubmit: formikSubmit,
          }) => {
            const onEditorTypeChange = (id: EditorType) => {
              if (id === EDITOR_TYPE.YAML) {
                const yaml = dirty || !rawFilter ? mapFormToYaml(values) : rawFilter;
                setRawFilter(yaml);
                const syntaxError = validateYamlSyntax(yaml);
                setYamlErrors(syntaxError ? [syntaxError] : null);
              } else {
                if (!validateYamlSyntax(rawFilter)) {
                  setValues(mapYamlToForm(rawFilter));
                }
                setYamlErrors(null);
              }
              setSelectedEditorType(id);
            };

            const onYamlChange = (yamlString: string) => {
              setRawFilter(yamlString);
              const syntaxError = validateYamlSyntax(yamlString);
              if (syntaxError) {
                setYamlErrors([syntaxError]);
                return;
              }
              const formValues = mapYamlToForm(yamlString);
              setValues(formValues);
              const fieldErrors = validateForm(formValues);
              const fieldErrorMessages = Object.values(fieldErrors).filter(Boolean) as string[];
              setYamlErrors(fieldErrorMessages.length > 0 ? fieldErrorMessages : null);
            };

            const yamlModeHasErrors =
              (yamlErrors !== null && yamlErrors.length > 0) || Object.keys(errors).length > 0;

            const yamlFormErrors =
              yamlErrors && yamlErrors.length > 0
                ? yamlErrors
                : Object.values(errors).filter((e): e is string => typeof e === 'string');

            return (
              <Form>
                <EuiPanel style={{ paddingBottom: '60px' }}>
                  <PageHeader appDescriptionControls={false as any}>
                    <EuiText size="s">
                      <h1>{actionLabels[action]} filter</h1>
                    </EuiText>
                    <EuiText size="s" color="subdued">
                      {action === FILTER_ACTION.CREATE ? (
                        <>
                          Create a new event filter in the <strong>{spaceFilter || 'draft'}</strong>{' '}
                          space.
                        </>
                      ) : (
                        <>
                          Edit the filter configuration in the{' '}
                          <strong>{spaceFilter || 'draft'}</strong> space.
                        </>
                      )}
                    </EuiText>
                    <EuiSpacer />
                  </PageHeader>

                  <EuiButtonGroup
                    legend="Editor type selector"
                    options={editorTypes}
                    idSelected={selectedEditorType}
                    onChange={(id: string) => onEditorTypeChange(id as EditorType)}
                  />
                  <EuiSpacer size="xl" />

                  {selectedEditorType === EDITOR_TYPE.VISUAL && (
                    <>
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
                                        <strong>Pre-filter:</strong> Processed before input is
                                        passed to the space decoder tree.
                                      </p>
                                    </EuiText>
                                    <EuiSpacer size="s" />
                                    <EuiText size="xs">
                                      <p>
                                        <strong>Post-filter:</strong> Processed after event is
                                        normalized by the space decoder tree, and enriched.
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
                        label={'Check'}
                        fullWidth
                        isInvalid={!!errors.check && touched.check}
                        error={errors.check}
                        helpText={checkHelpText}
                      >
                        <EuiCodeEditor
                          mode="yaml"
                          width="600px"
                          height="160px"
                          value={values.check}
                          onChange={(value: string) => setFieldValue('check', value)}
                          onBlur={() => setFieldTouched('check')}
                          setOptions={checkEditorOptions}
                          data-test-subj="filter-check-yaml-editor"
                          aria-label="Check YAML editor"
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
                        <EuiCompressedTextArea
                          placeholder="Enter documentation"
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
                    </>
                  )}
                  {selectedEditorType === EDITOR_TYPE.YAML && (
                    <YamlForm
                      type={YAML_TYPE.FILTER}
                      value={rawFilter}
                      isInvalid={yamlModeHasErrors}
                      errors={yamlFormErrors}
                      change={onYamlChange}
                    />
                  )}
                </EuiPanel>

                <EuiBottomBar>
                  <EuiFlexGroup
                    gutterSize="s"
                    justifyContent="flexEnd"
                    alignItems="center"
                    responsive={false}
                  >
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty
                        color="ghost"
                        size="s"
                        iconType="cross"
                        href={`#${ROUTES.FILTERS}`}
                      >
                        Cancel
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiToolTip
                        content={
                          (selectedEditorType === EDITOR_TYPE.VISUAL && isSubmitDisabled(errors)) ||
                          (selectedEditorType === EDITOR_TYPE.YAML && yamlModeHasErrors)
                            ? 'Please fill in all required fields'
                            : undefined
                        }
                        position="top"
                      >
                        <EuiButton
                          color="primary"
                          fill
                          iconType="check"
                          size="s"
                          disabled={
                            selectedEditorType === EDITOR_TYPE.VISUAL
                              ? isSubmitDisabled(errors)
                              : yamlModeHasErrors
                          }
                          isLoading={isSubmitting}
                          onClick={() => formikSubmit()}
                        >
                          {actionLabels[action]} filter
                        </EuiButton>
                      </EuiToolTip>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiBottomBar>
              </Form>
            );
          }}
        </Formik>
      )}
    </>
  );
};
