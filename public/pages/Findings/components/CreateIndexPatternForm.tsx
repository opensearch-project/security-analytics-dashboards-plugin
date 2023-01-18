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
import { IndexPatternsService } from '../../../services';

const ILLEGAL_CHARACTERS = [' ', '\\', '/', '?', '"', '<', '>', '|'];

const containsIllegalCharacters = (pattern: string) => {
  return ILLEGAL_CHARACTERS.some((char) => pattern.includes(char));
};

export interface CreateIndexPatternFormModel {
  name: string;
  timeField: string;
}

export interface CreateIndexPatternFormProps {
  initialValue: {
    name: string;
  };
  submit: (values: string) => void;
  cancel: () => void;
  indexPatternsService?: IndexPatternsService;
}

export const CreateIndexPatternForm: React.FC<CreateIndexPatternFormProps> = ({
  initialValue,
  submit,
  cancel,
  indexPatternsService,
}) => {
  const [timeFileds, setTimeFields] = useState<string[]>([]);

  const getTimeFields = async (name: string): Promise<string[]> => {
    if (!indexPatternsService) {
      return [];
    }

    return indexPatternsService
      .getFieldsForWildcard({
        pattern: `${name}`,
        metaFields: ['_source', '_id', '_type', '_index', '_score'],
        params: {},
      })
      .then((res) => {
        return res.filter((f) => f.type === 'date').map((f) => f.name);
      })
      .catch(() => {
        return [];
      });
  };

  useEffect(() => {
    getTimeFields(initialValue.name).then((fields) => {
      setTimeFields(fields);
    });
  }, [initialValue.name]);

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

        if (containsIllegalCharacters(values.name)) {
          errors.name =
            'A index pattern cannot contain spaces or the characters: , /, ?, ", <, >, |';
        }

        return errors;
      }}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(false);
        if (!indexPatternsService) {
          return;
        }
        try {
          const newIndex = await indexPatternsService.createAndSave({
            title: values.name,
            timeFieldName: values.timeField,
          });
          if (newIndex.id) {
            submit(newIndex.id);
          }
        } catch (e) {}
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
              onChange={async (e) => {
                props.handleChange('name')(e);
                const fileds = await getTimeFields(e.target.value);
                setTimeFields(fileds);
                props.setFieldValue('timeField', '');
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
