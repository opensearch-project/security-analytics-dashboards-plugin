/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState } from 'react';
import { Formik, Form, FormikErrors } from 'formik';
import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiCompressedFieldText,
  EuiSmallButton,
  EuiSpacer,
  EuiAccordion,
  EuiCompressedComboBox,
  EuiButtonGroup,
  EuiText,
  EuiTitle,
  EuiPanel,
  EuiLink,
} from '@elastic/eui';
import { FieldTextArray } from '../../../Rules/components/RuleEditor/components/FieldTextArray';
import { ruleSeverity, ruleStatus } from '../../../Rules/utils/constants';
import {
  AUTHOR_REGEX,
  RULE_DESCRIPTION_REGEX,
  RULE_NAME_REGEX,
  detectionRuleNameError,
  detectionRuleDescriptionError,
  validateDescription,
  validateName,
} from '../../../../utils/validation';
import { RuleEditorFormModel } from './RuleEditorFormModel';
import { FormSubmissionErrorToastNotification } from '../../../Rules/components/RuleEditor/FormSubmitionErrorToastNotification';
import { YamlRuleEditorComponent } from '../../../Rules/components/RuleEditor/components/YamlRuleEditorComponent/YamlRuleEditorComponent';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { DetectionVisualEditor } from '../../../Rules/components/RuleEditor/DetectionVisualEditor';
import { getSeverityLabel } from '../../../Correlations/utils/constants';
import { PageHeader } from '../../../../components/PageHeader/PageHeader';
import { TopNavControlLinkData } from '../../../../../../../src/plugins/navigation/public';
import {
  IntegrationComboBox,
  useIntegrationSelector,
} from '../../../../components/IntegrationComboBox';

export interface VisualRuleEditorProps {
  initialValue: RuleEditorFormModel;
  notifications?: NotificationsStart;
  validateOnMount?: boolean;
  submit: (values: RuleEditorFormModel, integrationId: string) => void;
  cancel: () => void;
  mode: 'create' | 'edit';
  title: string;
  subtitleData?: { description: string; links?: TopNavControlLinkData };
}

const editorTypes = [
  {
    id: 'visual',
    label: 'Visual Editor',
  },
  {
    id: 'yaml',
    label: 'YAML Editor',
  },
];

export const TAGS_PREFIX = 'attack.';

export const RuleEditorForm: React.FC<VisualRuleEditorProps> = ({
  initialValue,
  notifications,
  submit,
  cancel,
  mode,
  title,
  validateOnMount,
  subtitleData,
}) => {
  const [selectedEditorType, setSelectedEditorType] = useState('visual');
  const [isDetectionInvalid, setIsDetectionInvalid] = useState(false);
  const [integrationId, setIntegrationId] = useState('');

  const { loading: loadingIntegrations, options: integrationOptions } = useIntegrationSelector({
    notifications: notifications!,
    enabled: mode === 'create',
  });

  const validateTags = (fields: string[]) => {
    let isValid = true;
    let tag;
    for (let i = 0; i < fields.length; i++) {
      tag = fields[i];
      if (tag.length && !(tag.startsWith(TAGS_PREFIX) && tag.length > TAGS_PREFIX.length)) {
        isValid = false;
        break;
      }
    }

    return isValid;
  };

  return (
    <Formik
      initialValues={initialValue}
      validateOnMount={validateOnMount}
      validate={(values) => {
        const errors: FormikErrors<RuleEditorFormModel> = {};

        if (!values.name) {
          errors.name = 'Rule name is required';
        } else if (!validateName(values.name, RULE_NAME_REGEX)) {
          errors.name = 'Invalid rule name.';
        }

        if (
          values.description &&
          !validateDescription(values.description, RULE_DESCRIPTION_REGEX)
        ) {
          errors.description = detectionRuleDescriptionError;
        }

        if (!values.integration) {
          errors.integration = 'Integration is required';
        }

        if (!values.detection) {
          errors.detection = 'Detection is required';
        }

        if (!values.level) {
          errors.level = 'Rule level is required';
        } else if (!ruleSeverity.some((sev) => sev.value === values.level)) {
          errors.level = `Invalid rule level. Should be one of critical, high, medium, low, informational`;
        }

        if (!validateName(values.author, AUTHOR_REGEX)) {
          errors.author = 'Invalid author.';
        }

        if (!values.status) {
          errors.status = 'Rule status is required';
        } else if (!ruleStatus.includes(values.status)) {
          errors.status = `Invalid rule status. Should be one of experimental, test, stable`;
        }

        if (!validateTags(values.tags)) {
          errors.tags = `Tags must start with '${TAGS_PREFIX}'`;
        }
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        // Wazuh: fixed to prevent submission when it's visual editor to yaml works correctly
        if (isDetectionInvalid && selectedEditorType === 'visual') {
          return;
        }
        setSubmitting(false);
        submit(values, integrationId);
      }}
    >
      {(props) => (
        <Form>
          <EuiPanel className={'rule-editor-form'}>
            <PageHeader appDescriptionControls={subtitleData ? [subtitleData] : undefined}>
              <EuiText size="s">
                <h1>{title}</h1>
              </EuiText>
              {subtitleData && (
                <>
                  <EuiText size="s" color="subdued">
                    {subtitleData.description}
                  </EuiText>
                  {subtitleData.links && (
                    <EuiText size="s">
                      <EuiLink href={subtitleData.links.href} target="_blank">
                        {subtitleData.links.label}
                      </EuiLink>
                    </EuiText>
                  )}
                </>
              )}
              <EuiSpacer />
            </PageHeader>
            <EuiButtonGroup
              data-test-subj="change-editor-type"
              legend="This is editor type selector"
              options={editorTypes}
              idSelected={selectedEditorType}
              onChange={(id) => setSelectedEditorType(id)}
            />

            <EuiSpacer size="xl" />

            {selectedEditorType === 'yaml' && (
              <YamlRuleEditorComponent
                rule={mapFormToRule(props.values)}
                isInvalid={Object.keys(props.errors).length > 0}
                errors={Object.keys(props.errors).map(
                  (key) => props.errors[key as keyof RuleEditorFormModel] as string
                )}
                change={(e) => {
                  const formState = mapRuleToForm(e);
                  props.setValues(formState);
                }}
              ></YamlRuleEditorComponent>
            )}
            <FormSubmissionErrorToastNotification notifications={notifications} />
            {selectedEditorType === 'visual' && (
              <>
                <EuiTitle>
                  <EuiText size="s">
                    <h2>Rule overview</h2>
                  </EuiText>
                </EuiTitle>

                <EuiSpacer />

                <EuiCompressedFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Rule name</strong>
                    </EuiText>
                  }
                  isInvalid={(validateOnMount || props.touched.name) && !!props.errors?.name}
                  error={props.errors.name}
                  helpText={detectionRuleNameError}
                >
                  <EuiCompressedFieldText
                    isInvalid={(validateOnMount || props.touched.name) && !!props.errors?.name}
                    placeholder="My custom rule"
                    data-test-subj={'rule_name_field'}
                    onChange={(e) => {
                      props.handleChange('name')(e);
                    }}
                    onBlur={props.handleBlur('name')}
                    value={props.values.name}
                  />
                </EuiCompressedFormRow>

                <EuiSpacer size={'m'} />

                <EuiCompressedFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Description </strong>
                      <i>- optional</i>
                    </EuiText>
                  }
                  isInvalid={
                    (validateOnMount || props.touched.description) && !!props.errors?.description
                  }
                  error={props.errors.description}
                >
                  <EuiCompressedFieldText
                    data-test-subj={'rule_description_field'}
                    onChange={(e) => {
                      props.handleChange('description')(e.target.value);
                    }}
                    onBlur={props.handleBlur('description')}
                    value={props.values.description}
                    placeholder={'Detects ...'}
                  />
                </EuiCompressedFormRow>

                <EuiSpacer size={'m'} />

                <EuiCompressedFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Author</strong>
                    </EuiText>
                  }
                  helpText="Combine multiple authors separated with a comma"
                  isInvalid={(validateOnMount || props.touched.author) && !!props.errors?.author}
                  error={props.errors.author}
                >
                  <EuiCompressedFieldText
                    isInvalid={(validateOnMount || props.touched.author) && !!props.errors?.author}
                    placeholder="Enter author name"
                    data-test-subj={'rule_author_field'}
                    onChange={(e) => {
                      props.handleChange('author')(e);
                    }}
                    onBlur={props.handleBlur('author')}
                    value={props.values.author}
                  />
                </EuiCompressedFormRow>

                <EuiSpacer size={'xl'} />

                <EuiTitle>
                  <EuiText size="s">
                    <h2>Details</h2>
                  </EuiText>
                </EuiTitle>

                <EuiSpacer />
                {mode === 'create' ? (
                  <IntegrationComboBox
                    options={integrationOptions}
                    selectedId={integrationId}
                    isLoading={loadingIntegrations}
                    data-test-subj={'rule_integration_dropdown'}
                    resourceName="rules"
                    isInvalid={
                      (validateOnMount || props.touched.integration) && !!props.errors?.integration
                    }
                    error={props.errors.integration}
                    onChange={(selected) => {
                      const option = selected[0] ?? null;
                      setIntegrationId(option?.id ?? '');
                      props.setFieldValue('integration', option?.label ?? '', true);
                      props.setFieldTouched('integration', true, false);
                    }}
                  />
                ) : (
                  <EuiCompressedFormRow
                    label={
                      <EuiText size={'s'}>
                        <strong>Integration</strong>
                      </EuiText>
                    }
                  >
                    <EuiCompressedFieldText
                      value={props.values.integration}
                      readOnly
                      data-test-subj={'rule_integration_field'}
                    />
                  </EuiCompressedFormRow>
                )}

                <EuiSpacer />

                <EuiCompressedFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Rule level (severity)</strong>
                    </EuiText>
                  }
                  isInvalid={(validateOnMount || props.touched.level) && !!props.errors?.level}
                  error={props.errors.level}
                >
                  <EuiCompressedComboBox
                    isInvalid={(validateOnMount || props.touched.level) && !!props.errors?.level}
                    placeholder="Select a rule level"
                    data-test-subj={'rule_severity_dropdown'}
                    options={ruleSeverity.map(({ name, value }) => ({ label: name, value }))}
                    singleSelection={{ asPlainText: true }}
                    onChange={(e) => props.handleChange('level')(e[0]?.value ?? '')}
                    onBlur={props.handleBlur('level')}
                    selectedOptions={
                      props.values.level
                        ? [
                            {
                              value: props.values.level,
                              label: getSeverityLabel(props.values.level),
                            },
                          ]
                        : []
                    }
                  />
                </EuiCompressedFormRow>

                <EuiSpacer />

                <EuiCompressedFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Rule Status</strong>
                    </EuiText>
                  }
                  isInvalid={(validateOnMount || props.touched.status) && !!props.errors?.status}
                  error={props.errors.status}
                >
                  <EuiCompressedComboBox
                    isInvalid={(validateOnMount || props.touched.status) && !!props.errors?.status}
                    placeholder="Select a rule status"
                    data-test-subj={'rule_status_dropdown'}
                    options={ruleStatus.map((type: string) => ({ value: type, label: type }))}
                    singleSelection={{ asPlainText: true }}
                    onChange={(e) => props.handleChange('status')(e[0]?.value ?? '')}
                    onBlur={props.handleBlur('status')}
                    selectedOptions={
                      props.values.status
                        ? [{ value: props.values.status, label: String(props.values.status) }]
                        : []
                    }
                  />
                </EuiCompressedFormRow>

                <EuiSpacer size={'xxl'} />

                <EuiTitle>
                  <EuiText size="s">
                    <h2>Detection</h2>
                  </EuiText>
                </EuiTitle>
                <EuiText size="s">
                  <p>Define the detection criteria for the rule</p>
                </EuiText>

                <EuiSpacer />

                <DetectionVisualEditor
                  isInvalid={(validateOnMount || props.touched.detection) && isDetectionInvalid}
                  detectionYml={props.values.detection}
                  goToYamlEditor={setSelectedEditorType}
                  setIsDetectionInvalid={(isInvalid: boolean) => {
                    if (isInvalid) {
                      props.errors.detection = 'Invalid detection entries';
                    } else {
                      delete props.errors.detection;
                    }

                    setIsDetectionInvalid(isInvalid);
                  }}
                  onChange={(detection: string) => {
                    props.handleChange('detection')(detection);
                  }}
                />

                <EuiSpacer size={'xl'} />

                <div style={{ maxWidth: 1000 }}>
                  <EuiAccordion
                    id={'additional-details'}
                    initialIsOpen={true}
                    buttonContent={
                      <>
                        Additional details <i>- optional</i>
                      </>
                    }
                    paddingSize="l"
                  >
                    <div className={'rule-editor-form-additional-details-panel-body'}>
                      <FieldTextArray
                        name="tags"
                        placeholder={'tag'}
                        label={
                          <>
                            <EuiText size={'m'}>
                              <strong>Tags </strong>
                              <i>- optional</i>
                            </EuiText>

                            <EuiSpacer size={'m'} />

                            <EuiText size={'xs'}>
                              <strong>Tag</strong>
                            </EuiText>
                          </>
                        }
                        addButtonName="Add tag"
                        fields={props.values.tags}
                        error={props.errors.tags}
                        isInvalid={(validateOnMount || props.touched.tags) && !!props.errors.tags}
                        onChange={(tags) => {
                          props.touched.tags = true;
                          props.setFieldValue('tags', tags);
                        }}
                        data-test-subj={'rule_tags_field'}
                      />

                      <FieldTextArray
                        name="references"
                        placeholder={'http://'}
                        label={
                          <>
                            <EuiText size={'m'}>
                              <strong>References </strong>
                              <i>- optional</i>
                            </EuiText>

                            <EuiSpacer size={'m'} />

                            <EuiText size={'xs'}>
                              <strong>URL</strong>
                            </EuiText>
                          </>
                        }
                        addButtonName="Add URL"
                        fields={props.values.references}
                        error={props.errors.references}
                        isInvalid={
                          (validateOnMount || props.touched.references) &&
                          !!props.errors?.references
                        }
                        onChange={(references) => {
                          props.touched.references = true;
                          props.setFieldValue('references', references);
                        }}
                        data-test-subj={'rule_references_field'}
                      />

                      <FieldTextArray
                        name="false_positives"
                        placeholder={'format?'}
                        label={
                          <>
                            <EuiText size={'m'}>
                              <strong>False positive cases </strong>
                              <i>- optional</i>
                            </EuiText>

                            <EuiSpacer size={'m'} />

                            <EuiText size={'xs'}>
                              <strong>Description</strong>
                            </EuiText>
                          </>
                        }
                        addButtonName="Add false positive"
                        fields={props.values.falsePositives}
                        error={props.errors.falsePositives}
                        isInvalid={
                          (validateOnMount || props.touched.falsePositives) &&
                          !!props.errors?.falsePositives
                        }
                        onChange={(falsePositives) => {
                          props.touched.falsePositives = true;
                          props.setFieldValue('falsePositives', falsePositives);
                        }}
                        data-test-subj={'rule_falsePositives_field'}
                      />
                    </div>
                  </EuiAccordion>
                </div>
              </>
            )}
          </EuiPanel>

          <EuiSpacer />

          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiSmallButton onClick={cancel}>Cancel</EuiSmallButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                onClick={() => props.handleSubmit()}
                data-test-subj={'submit_rule_form_button'}
                fill
              >
                {mode === 'create' ? 'Create rule' : 'Save changes'}
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Form>
      )}
    </Formik>
  );
};
