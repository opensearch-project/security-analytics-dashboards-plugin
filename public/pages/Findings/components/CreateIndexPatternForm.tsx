/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Formik, Form, FormikErrors } from 'formik';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCompressedFormRow,
  EuiFieldText,
  EuiSmallButton,
  EuiSpacer,
  EuiComboBox,
  EuiText,
  EuiCallOut,
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
  created: (values: string) => void;
  close: () => void;
  indexPatternsService: IndexPatternsService;
}

export const CreateIndexPatternForm: React.FC<CreateIndexPatternFormProps> = ({
  initialValue,
  created,
  close,
  indexPatternsService,
}) => {
  const [timeFields, setTimeFields] = useState<string[]>([]);
  const [createdIndex, setCreatedIndex] = useState<{ id?: string; title: string }>();

  const getTimeFields = useCallback(
    async (name: string): Promise<string[]> => {
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
    },
    [initialValue]
  );

  useEffect(() => {
    getTimeFields(initialValue.name).then((fields) => {
      setTimeFields(fields);
    });
  }, [initialValue.name]);

  return createdIndex ? (
    <>
      <EuiCallOut title={`${createdIndex?.title} has been successfully created`} color="success">
        <p>You may now view surrounding documents within the index</p>
      </EuiCallOut>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            fill
            onClick={() => {
              created(createdIndex?.id || '');
            }}
          >
            View surrounding documents
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  ) : (
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
      onSubmit={async (values) => {
        try {
          const newIndex = await indexPatternsService.createAndSave({
            title: values.name,
            timeFieldName: values.timeField,
          });
          setCreatedIndex({ id: newIndex.id, title: newIndex.title });
        } catch (e) {
          console.warn(e);
        }
      }}
    >
      {(props) => (
        <Form>
          <EuiText>
            An index pattern is required to view all surrounding documents within the index. Create
            an index pattern to continue.
          </EuiText>
          <EuiSpacer />
          <EuiCompressedFormRow
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
                const fields = await getTimeFields(e.target.value);
                setTimeFields(fields);
                props.setFieldValue('timeField', '');
              }}
              onBlur={props.handleBlur('name')}
              value={props.values.name}
            />
          </EuiCompressedFormRow>

          <EuiCompressedFormRow
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
              options={timeFields.map((field: string) => ({ value: field, label: field }))}
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
          </EuiCompressedFormRow>

          <EuiSpacer />

          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiSmallButton onClick={() => close()}>Cancel</EuiSmallButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                data-test-subj={'index_pattern_form_submit_button'}
                isLoading={props.isSubmitting}
                fill
                onClick={() => props.handleSubmit()}
              >
                Create index pattern
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Form>
      )}
    </Formik>
  );
};
