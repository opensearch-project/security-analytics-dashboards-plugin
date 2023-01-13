/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Formik, Form, FormikErrors } from 'formik';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
  EuiSpacer,
  EuiComboBox,
  EuiText,
} from '@elastic/eui';
import { OpenSearchService } from '../../../services';

export interface CreateIndexPatternFormModel {
  name: string;
  timeField: string;
}

export interface CreateIndexPatternFormProps {
  initialValue: {
    name: string;
  };
  submit: (values: CreateIndexPatternFormModel) => void;
  cancel: () => void;
  opensearchService: OpenSearchService;
}

export const CreateIndexPatternForm: React.FC<CreateIndexPatternFormProps> = ({
  initialValue,
  submit,
  cancel,
  opensearchService,
}) => {
  const [timeFileds, setTimeFields] = useState<string[]>([]);

  const getTimeFields = async () => {
    opensearchService
      .getFieldsForWildcard({
        pattern: 'cyp*',
        metaFields: ['_source', '_id', '_type', '_index', '_score'],
        params: {},
      })
      .then(({ fields }) => {
        console.log(fields);
        setTimeFields(fields.map((f) => f.name));
      });
  };

  useEffect(() => {
    getTimeFields();
  }, []);

  return (
    <Formik
      initialValues={{ ...initialValue, timeField: '' }}
      validate={(values) => {
        const errors: FormikErrors<CreateIndexPatternFormModel> = {};

        if (!values.name) {
          errors.name = 'Index patter name is required';
        }

        if (!values.timeField) {
          errors.timeField = 'Time field is required';
        }

        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        submit(values);
      }}
    >
      {(props) => (
        <Form>
          <EuiFormRow
            label={
              <EuiText size={'s'}>
                <strong>Specify index pattern name</strong>
              </EuiText>
            }
            isInvalid={props.touched.name && !!props.errors?.name}
            error={props.errors.name}
          >
            <EuiFieldText
              isInvalid={props.touched.name && !!props.errors.name}
              placeholder="Enter index pattern name"
              data-test-subj={'index_pattern_name_field'}
              onChange={(e) => {
                props.handleChange('name')(e);
              }}
              onBlur={props.handleBlur('name')}
              value={props.values.name}
            />
          </EuiFormRow>

          <EuiFormRow
            label={
              <EuiText size={'s'}>
                <strong>Time filed</strong>
              </EuiText>
            }
            isInvalid={props.touched.timeField && !!props.errors?.timeField}
            error={props.errors.timeField}
          >
            <EuiComboBox
              isInvalid={props.touched.timeField && !!props.errors.timeField}
              placeholder="Select a time field"
              data-test-subj={'index_pattern_time_field_dropdown'}
              options={timeFileds.map((field: string) => ({ value: field, label: field }))}
              singleSelection={{ asPlainText: true }}
              onChange={(e) => {
                props.handleChange('timeField')(e[0]?.value ? e[0].value : '');
              }}
              onBlur={props.handleBlur('timeField')}
              selectedOptions={
                props.values.timeField
                  ? [{ value: props.values.timeField, label: props.values.timeField }]
                  : []
              }
            />
          </EuiFormRow>

          <EuiSpacer />

          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton onClick={cancel}>Cancel</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill onClick={() => props.handleSubmit()}>
                Create index pattern
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Form>
      )}
    </Formik>
  );
};
