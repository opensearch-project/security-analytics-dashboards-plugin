import React, { useReducer, useEffect } from 'react';
import { ruleTypes } from '../../../../../lib/helpers';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
  EuiButton,
  EuiSpacer,
  EuiCodeBlock,
  EuiTextArea,
  EuiCodeBlock,
  EuiIcon,
} from '@elastic/eui';

export const Edit = (props: any) => {
  // const {importedTitle, importedDescription, importedLevel} = props.props;
  return (
    <Formik
      validateOnMount
      initialValues={{
        ruleName: '',
        ruleType: '',
        ruleDescription: '',
        ruleDetection: '',
        securityLevel: '',
        tag1: '',
        tag2: '',
        tag3: '',
        tag4: '',
      }}
      validationSchema={Yup.object({
        ruleName: Yup.string().required('Required'),
        ruleType: Yup.string().required(),
        ruleDescription: Yup.string().required('Required'),
        ruleDetection: Yup.string().required('Required'),
        securityLevel: Yup.string().required(),
        tag1: Yup.string(),
        tag2: Yup.string(),
        tag3: Yup.string(),
        tag4: Yup.string(),
      })}
      onSubmit={(values) => {
        console.log('SUBMIT', values);
      }}
    >
      {(Formikprops) => {
        return (
          <EuiForm component="form" onSubmit={Formikprops.handleSubmit}>
            <EuiSpacer />
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFormRow
                  label="Rule name"
                  helpText={Formikprops.touched.ruleName && Formikprops.errors.ruleName}
                >
                  <EuiFieldText
                    name="ruleName"
                    value={Formikprops.values.ruleName}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Rule type">
                  <EuiSelect
                    name="ruleType"
                    hasNoInitialSelection={true}
                    options={ruleTypes.map((type: object) => ({ value: type, text: type }))}
                    onChange={Formikprops.handleChange}
                    value={Formikprops.values.ruleType}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer />
            <EuiFormRow
              label="Description"
              fullWidth
              helpText={Formikprops.touched.ruleDescription && Formikprops.errors.ruleDescription}
            >
              <EuiTextArea
                name="ruleDescription"
                fullWidth
                value={Formikprops.values.ruleDescription}
                onChange={Formikprops.handleChange}
                onBlur={Formikprops.handleBlur}
              />
            </EuiFormRow>

            <EuiSpacer />

            {/* <EuiTextArea
                fullWidth
                name="ruleDetection"
                value={Formikprops.values.ruleDetection}
                onChange={Formikprops.handleChange}
                onBlur={Formikprops.handleBlur}
              /> */}
            {/* <EuiCodeEditor
              mode="yaml"
              theme="github"
              width="100%"
              height="300px"
              setOptions={{
                fontSize: '14px',
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,
              }}
              onLoad={(editor) => {
                // console.log(editor);
              }}
            /> */}

            <EuiSpacer />

            <EuiFormRow
              label="Security level"
              helpText={Formikprops.touched.securityLevel && Formikprops.errors.securityLevel}
            >
              <EuiSelect
                name="securityLevel"
                hasNoInitialSelection={true}
                options={[
                  { value: 'Critical', text: 'Critical' },
                  { value: 'High', text: 'High' },
                  { value: 'Medium', text: 'Medium' },
                  { value: 'Low', text: 'Low' },
                ]}
                onChange={Formikprops.handleChange}
                value={Formikprops.values.securityLevel}
              />
            </EuiFormRow>

            <EuiSpacer />

            <EuiFlexGroup style={{ maxWidth: 600 }}>
              <EuiFlexItem>
                <EuiFormRow label="Tags">
                  <EuiFieldText
                    name="tag1"
                    value={Formikprops.values.tag1}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                    append={
                      <div
                        style={
                          Formikprops.values.tag1.length > 0
                            ? { display: 'block' }
                            : { display: 'none' }
                        }
                      >
                        <EuiIcon
                          id="tagIcon"
                          type="crossInACircleFilled"
                          onClick={() => Formikprops.setFieldValue('tag1', '')}
                        />
                      </div>
                    }
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Tags">
                  <EuiFieldText
                    name="tag2"
                    value={Formikprops.values.tag2}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                    append={
                      <div
                        style={
                          Formikprops.values.tag2.length > 0
                            ? { display: 'block' }
                            : { display: 'none' }
                        }
                      >
                        <EuiIcon
                          id="tagIcon"
                          type="crossInACircleFilled"
                          onClick={() => Formikprops.setFieldValue('tag2', '')}
                        />
                      </div>
                    }
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer />

            <EuiFlexGroup style={{ maxWidth: 600 }}>
              <EuiFlexItem>
                <EuiFormRow label="Tags">
                  <EuiFieldText
                    name="tag3"
                    value={Formikprops.values.tag3}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                    append={
                      <div
                        style={
                          Formikprops.values.tag3.length > 0
                            ? { display: 'block' }
                            : { display: 'none' }
                        }
                      >
                        <EuiIcon
                          id="tagIcon"
                          type="crossInACircleFilled"
                          onClick={() => Formikprops.setFieldValue('tag3', '')}
                        />
                      </div>
                    }
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Tags">
                  <EuiFieldText
                    name="tag4"
                    value={Formikprops.values.tag4}
                    onChange={Formikprops.handleChange}
                    onBlur={Formikprops.handleBlur}
                    append={
                      <div
                        style={
                          Formikprops.values.tag4.length > 0
                            ? { display: 'block' }
                            : { display: 'none' }
                        }
                      >
                        <EuiIcon
                          id="tagIcon"
                          type="crossInACircleFilled"
                          onClick={() => Formikprops.setFieldValue('tag4', '')}
                        />
                      </div>
                    }
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer />

            <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiButton fill color="ghost">
                  Cancel
                </EuiButton>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiButton
                  type="submit"
                  fill
                  disabled={!Boolean(Object.keys(Formikprops.errors).length === 0)}
                >
                  Save
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiForm>
        );
      }}
    </Formik>
  );
};
