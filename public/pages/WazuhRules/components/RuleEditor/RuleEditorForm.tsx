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
  EuiSwitch,
  EuiToolTip,
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
import { YamlRuleEditorComponent } from './components/YamlRuleEditorComponent/YamlRuleEditorComponent';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { DetectionVisualEditor } from '../../../Rules/components/RuleEditor/DetectionVisualEditor';
import { MitreVisualEditor } from './components/MitreVisualEditor/MitreVisualEditor';
import { ComplianceVisualEditor } from './components/ComplianceVisualEditor/ComplianceVisualEditor';
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

  const hasAdditionalDetails =
    initialValue.tags.length > 0 ||
    initialValue.metadata.references.length > 0 ||
    initialValue.metadata.supports.length > 0 ||
    !!initialValue.metadata.documentation ||
    initialValue.falsePositives.length > 0;

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

        if (!values.metadata.title) {
          errors.metadata = { ...(errors.metadata ?? {}), title: 'Rule name is required' };
        } else if (!validateName(values.metadata.title, RULE_NAME_REGEX)) {
          errors.metadata = { ...(errors.metadata ?? {}), title: 'Invalid rule name.' };
        }

        if (
          values.metadata.description &&
          !validateDescription(values.metadata.description, RULE_DESCRIPTION_REGEX)
        ) {
          errors.metadata = {
            ...(errors.metadata ?? {}),
            description: detectionRuleDescriptionError,
          };
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

        if (!validateName(values.metadata.author, AUTHOR_REGEX)) {
          errors.metadata = { ...(errors.metadata ?? {}), author: 'Invalid author.' };
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
              <>
                {mode === 'create' && (
                  <>
                    <IntegrationComboBox
                      options={integrationOptions}
                      selectedId={integrationId}
                      isLoading={loadingIntegrations}
                      data-test-subj={'rule_integration_dropdown'}
                      resourceName="rules"
                      isInvalid={
                        (validateOnMount || props.touched.integration) &&
                        !!props.errors?.integration
                      }
                      error={props.errors.integration}
                      onChange={(selected) => {
                        const option = selected[0] ?? null;
                        setIntegrationId(option?.id ?? '');
                        props.setFieldValue(
                          'integration',
                          option?.value ?? option?.label ?? '',
                          true
                        );
                        props.setFieldTouched('integration', true, false);
                      }}
                    />
                    <EuiSpacer size="xl" />
                  </>
                )}
                <YamlRuleEditorComponent
                  rule={mapFormToRule(props.values)}
                  isInvalid={Object.keys(props.errors).length > 0}
                  errors={Object.values(props.errors).flatMap((v) =>
                    typeof v === 'string'
                      ? [v]
                      : v && typeof v === 'object'
                      ? Object.values(v).filter((x) => typeof x === 'string')
                      : []
                  )}
                  change={(e) => {
                    const formState = mapRuleToForm(e);
                    props.setValues(formState);
                  }}
                />
              </>
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
                  isInvalid={
                    (validateOnMount || props.touched.metadata?.title) &&
                    !!props.errors?.metadata?.title
                  }
                  error={props.errors?.metadata?.title}
                  helpText={detectionRuleNameError}
                >
                  <EuiCompressedFieldText
                    isInvalid={
                      (validateOnMount || props.touched.metadata?.title) &&
                      !!props.errors?.metadata?.title
                    }
                    placeholder="My custom rule"
                    data-test-subj={'rule_name_field'}
                    onChange={(e) => {
                      props.handleChange('metadata.title')(e);
                    }}
                    onBlur={props.handleBlur('metadata.title')}
                    value={props.values.metadata.title}
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
                    (validateOnMount || props.touched.metadata?.description) &&
                    !!props.errors?.metadata?.description
                  }
                  error={props.errors?.metadata?.description}
                >
                  <EuiCompressedFieldText
                    data-test-subj={'rule_description_field'}
                    onChange={(e) => {
                      props.handleChange('metadata.description')(e.target.value);
                    }}
                    onBlur={props.handleBlur('metadata.description')}
                    value={props.values.metadata.description}
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
                  isInvalid={
                    (validateOnMount || props.touched.metadata?.author) &&
                    !!props.errors?.metadata?.author
                  }
                  error={props.errors?.metadata?.author}
                >
                  <EuiCompressedFieldText
                    isInvalid={
                      (validateOnMount || props.touched.metadata?.author) &&
                      !!props.errors?.metadata?.author
                    }
                    placeholder="Enter author name"
                    data-test-subj={'rule_author_field'}
                    onChange={(e) => {
                      props.handleChange('metadata.author')(e);
                    }}
                    onBlur={props.handleBlur('metadata.author')}
                    value={props.values.metadata.author}
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
                      props.setFieldValue(
                        'integration',
                        option?.value ?? option?.label ?? '',
                        true
                      );
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

                <EuiSpacer />

                <EuiCompressedFormRow
                  label={
                    <EuiText size={'s'}>
                      <strong>Enabled</strong>
                    </EuiText>
                  }
                >
                  <EuiSwitch
                    label={props.values.enabled ? 'Rule is enabled' : 'Rule is disabled'}
                    checked={props.values.enabled}
                    onChange={(e) => props.setFieldValue('enabled', e.target.checked)}
                    data-test-subj={'rule_enabled_toggle'}
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

                <EuiSpacer size="xl" />

                <EuiAccordion
                  id="mitre-attack"
                  initialIsOpen={!!props.values.mitre}
                  buttonContent={
                    <>
                      MITRE ATT&CK <i>- optional</i>
                      <EuiText size="xs" color="subdued">
                        Map this rule to MITRE ATT&CK tactics, techniques and subtechniques.
                      </EuiText>
                    </>
                  }
                  paddingSize="l"
                >
                  <EuiSpacer size="s" />
                  <MitreVisualEditor
                    mitreYml={props.values.mitre || ''}
                    onChange={(value) => props.setFieldValue('mitre', value)}
                  />
                </EuiAccordion>

                <EuiSpacer size="xl" />

                <EuiAccordion
                  id="compliance"
                  initialIsOpen={!!props.values.compliance}
                  buttonContent={
                    <>
                      Compliance <i>- optional</i>
                      <EuiText size="xs" color="subdued">
                        Map this rule to compliance frameworks (PCI DSS, GDPR, HIPAA, etc.).
                      </EuiText>
                    </>
                  }
                  paddingSize="l"
                >
                  <EuiSpacer size="s" />
                  <ComplianceVisualEditor
                    complianceYml={props.values.compliance || ''}
                    onChange={(value) => props.setFieldValue('compliance', value)}
                  />
                </EuiAccordion>

                <EuiSpacer size={'xl'} />

                <div style={{ maxWidth: 1000 }}>
                  <EuiAccordion
                    id={'additional-details'}
                    initialIsOpen={hasAdditionalDetails}
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
                        fields={props.values.metadata.references}
                        error={props.errors?.metadata?.references}
                        isInvalid={
                          (validateOnMount || props.touched.metadata?.references) &&
                          !!props.errors?.metadata?.references
                        }
                        onChange={(references) => {
                          props.setFieldTouched('metadata.references', true, false);
                          props.setFieldValue('metadata.references', references);
                        }}
                        data-test-subj={'rule_references_field'}
                      />

                      <FieldTextArray
                        name="supports"
                        placeholder={'Support (e.g. 2.1.0)'}
                        label={
                          <>
                            <EuiText size={'m'}>
                              <strong>Supports </strong>
                              <i>- optional</i>
                            </EuiText>

                            <EuiSpacer size={'m'} />

                            <EuiText size={'xs'}>
                              <strong>Support</strong>
                            </EuiText>
                          </>
                        }
                        addButtonName="Add support"
                        fields={props.values.metadata.supports}
                        error={props.errors?.metadata?.supports}
                        isInvalid={
                          (validateOnMount || props.touched.metadata?.supports) &&
                          !!props.errors?.metadata?.supports
                        }
                        onChange={(supports) => {
                          props.setFieldTouched('metadata.supports', true, false);
                          props.setFieldValue('metadata.supports', supports);
                        }}
                        data-test-subj={'rule_supports_field'}
                      />

                      <EuiCompressedFormRow
                        label={
                          <EuiText size={'s'}>
                            <strong>Documentation </strong>
                            <i>- optional</i>
                          </EuiText>
                        }
                      >
                        <EuiCompressedFieldText
                          placeholder="https://documentation.example.com"
                          data-test-subj={'rule_documentation_field'}
                          value={props.values.metadata.documentation}
                          onChange={(e) => {
                            props.setFieldValue('metadata.documentation', e.target.value);
                            props.setFieldTouched('metadata.documentation', true, false);
                          }}
                          onBlur={props.handleBlur('metadata.documentation')}
                        />
                      </EuiCompressedFormRow>

                      <FieldTextArray
                        name="false_positives"
                        placeholder={'False positive when...'}
                        label={
                          <>
                            <EuiText size={'m'}>
                              <strong>False positive cases </strong>
                              <i>- optional</i>
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
                  <EuiSpacer size={'m'} />
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
              <EuiToolTip
                content={
                  <>
                    <p>
                      {mode === 'create' && !integrationId
                        ? 'Select an integration to enable creating the rule'
                        : ''}
                    </p>
                    <p>
                      {Object.keys(props.errors).length > 0
                        ? 'Please fix the errors in the form to proceed'
                        : ''}
                    </p>
                  </>
                }
                position="top"
              >
                <EuiSmallButton
                  disabled={
                    (mode === 'create' && !integrationId) || Object.keys(props.errors).length > 0
                  }
                  onClick={() => props.handleSubmit()}
                  data-test-subj={'submit_rule_form_button'}
                  fill
                >
                  {mode === 'create' ? 'Create rule' : 'Save changes'}
                </EuiSmallButton>
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Form>
      )}
    </Formik>
  );
};
