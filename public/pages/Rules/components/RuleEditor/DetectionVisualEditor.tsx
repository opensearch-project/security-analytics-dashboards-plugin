/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { dump, load } from 'js-yaml';
import {
  EuiAccordion,
  EuiToolTip,
  EuiButtonIcon,
  EuiTitle,
  EuiText,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiComboBox,
  EuiPanel,
  EuiRadioGroup,
  EuiTextArea,
  EuiButton,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiFilePicker,
  EuiButtonEmpty,
  EuiCallOut,
} from '@elastic/eui';
import _ from 'lodash';
import { validateCondition, validateDetectionFieldName } from '../../../../utils/validation';
import { SelectionExpField } from './components/SelectionExpField';

export interface DetectionVisualEditorProps {
  detectionYml: string;
  onChange: (value: string) => void;
  goToYamlEditor: (value: string) => void;
  setIsDetectionInvalid: (isInvalid: boolean) => void;
  mode?: string;
  isInvalid?: boolean;
}

interface Errors {
  fields: { [key: string]: string };
  touched: { [key: string]: boolean };
}

interface DetectionVisualEditorState {
  detectionObj: DetectionObject;
  fileUploadModalState?: {
    selectionIdx: number;
    dataIdx: number;
  };
  errors: Errors;
  invalidFile: boolean;
}

interface SelectionData {
  field: string;
  modifier?: string;
  values: string[];
  selectedRadioId?: string;
}

export interface Selection {
  name: string;
  data: SelectionData[];
}

interface DetectionObject {
  condition: string;
  selections: Selection[];
}

enum SelectionMapValueRadioId {
  VALUE = 'selection-map-value',
  LIST = 'selection-map-list',
}

const detectionModifierOptions = [
  { value: 'contains', label: 'contains' },
  { value: 'all', label: 'all' },
  { value: 'base64', label: 'base64' },
  { value: 'endswith', label: 'endswith' },
  { value: 'startswith', label: 'startswith' },
];

const defaultDetectionObj: DetectionObject = {
  condition: '',
  selections: [
    {
      name: 'Selection_1',
      data: [
        {
          field: '',
          values: [''],
          modifier: detectionModifierOptions[0].value,
        },
      ],
    },
  ],
};

const ONE_MEGA_BYTE = 1048576; //Bytes

export class DetectionVisualEditor extends React.Component<
  DetectionVisualEditorProps,
  DetectionVisualEditorState
> {
  constructor(props: DetectionVisualEditorProps) {
    super(props);
    this.state = {
      detectionObj: this.parseDetectionYml(),
      errors: {
        fields: {},
        touched: {},
      },
      invalidFile: false,
    };
  }

  public componentDidUpdate(
    prevProps: Readonly<DetectionVisualEditorProps>,
    prevState: Readonly<DetectionVisualEditorState>,
    snapshot?: any
  ): void {
    if (prevState.detectionObj !== this.state.detectionObj) {
      this.props.onChange(this.createDetectionYml());
    }

    const isValid = !!Object.keys(this.state.errors.fields).length || !this.validateValuesExist();
    this.props.setIsDetectionInvalid(isValid);

    if (this.props.isInvalid != prevProps.isInvalid) {
      this.validateCondition(this.state.detectionObj.condition);
      this.validateDatum(this.state.detectionObj.selections);
    }
  }

  private validateValuesExist() {
    return !this.state.detectionObj.selections.some((selection) => {
      return selection.data.some((datum) => !datum.values[0]);
    });
  }

  private parseDetectionYml = (): DetectionObject => {
    const detectionJSON: any = load(this.props.detectionYml);
    const detectionObj: DetectionObject = {
      ...defaultDetectionObj,
    };

    if (!detectionJSON) {
      return detectionObj;
    }

    detectionObj.condition = detectionJSON.condition ?? detectionObj.condition;
    detectionObj.selections = [];

    delete detectionJSON.condition;

    Object.keys(detectionJSON).forEach((selectionKey, selectionIdx) => {
      const selectionMapJSON = detectionJSON[selectionKey];
      const selectionDataEntries: SelectionData[] = [];

      Object.keys(selectionMapJSON).forEach((fieldKey, dataIdx) => {
        const [field, modifier] = fieldKey.split('|');
        const val = selectionMapJSON[fieldKey];
        const values: any[] = typeof val === 'string' ? [val] : val;
        selectionDataEntries.push({
          field,
          modifier,
          values,
          selectedRadioId: `${
            values.length <= 1 ? SelectionMapValueRadioId.VALUE : SelectionMapValueRadioId.LIST
          }-${selectionIdx}-${dataIdx}`,
        });
      });

      detectionObj.selections.push({
        name: selectionKey,
        data: selectionDataEntries,
      });
    });

    return detectionObj;
  };

  private createDetectionYml = (): string => {
    const { condition, selections } = this.state.detectionObj;
    const compiledDetection: any = {
      condition,
    };

    selections.forEach((selection) => {
      const selectionMaps: any = {};

      selection.data.forEach((datum) => {
        const key = `${datum.field}${datum.modifier ? `|${datum.modifier}` : ''}`;
        selectionMaps[key] = datum.values;
      });

      compiledDetection[selection.name] = selectionMaps;
    });

    return dump(compiledDetection);
  };

  private validateDatum = (selections: Selection[]) => {
    const { errors } = this.state;
    selections.map((selection, selIdx) => {
      const fieldNames = new Set<string>();
      selection.data.map((data, idx) => {
        if ('field' in data) {
          const fieldName = `field_${selIdx}_${idx}`;
          delete errors.fields[fieldName];
          if (!data.field) {
            errors.fields[fieldName] = 'Key name is required';
          } else if (fieldNames.has(data.field)) {
            errors.fields[fieldName] = 'Key name already used';
          } else {
            fieldNames.add(data.field);
            if (!validateDetectionFieldName(data.field)) {
              errors.fields[fieldName] = 'Invalid key name.';
            }
          }
          errors.touched[fieldName] = true;
        }

        if ('values' in data) {
          const valueId = `value_${selIdx}_${idx}`;
          delete errors.fields[valueId];
          if (data.values.length === 1 && !data.values[0]) {
            errors.fields[valueId] = 'Value is required';
          }
          errors.touched[valueId] = true;
        }
      });
    });
    this.setState({
      errors,
    });
  };

  private updateDatumInState = (
    selectionIdx: number,
    dataIdx: number,
    newDatum: Partial<SelectionData>
  ) => {
    const { condition, selections } = this.state.detectionObj;
    const selection = selections[selectionIdx];
    const datum = selection.data[dataIdx];
    const newSelections = [
      ...selections.slice(0, selectionIdx),
      {
        ...selection,
        data: [
          ...selection.data.slice(0, dataIdx),
          {
            ...datum,
            ...newDatum,
          },
          ...selection.data.slice(dataIdx + 1),
        ],
      },
      ...selections.slice(selectionIdx + 1),
    ];

    this.setState(
      {
        detectionObj: {
          condition,
          selections: newSelections,
        },
      },
      () => {
        this.validateDatum(newSelections);
      }
    );
  };

  private updateSelection = (selectionIdx: number, newSelection: Partial<Selection>) => {
    const { condition, selections } = this.state.detectionObj;
    const { errors } = this.state;
    const selection = selections[selectionIdx];

    delete errors.fields['name'];
    if (!selection.name) {
      errors.fields['name'] = 'Selection name is required';
    } else {
      if (!validateDetectionFieldName(selection.name)) {
        errors.fields['name'] = 'Invalid selection name.';
      } else {
        selections.map((sel, selIdx) => {
          if (selIdx !== selectionIdx && sel.name === newSelection.name) {
            errors.fields['name'] = 'Selection name already exists.';
          }
        });
      }
    }
    errors.touched['name'] = true;

    this.setState(
      {
        detectionObj: {
          condition,
          selections: [
            ...selections.slice(0, selectionIdx),
            {
              ...selection,
              ...newSelection,
            },
            ...selections.slice(selectionIdx + 1),
          ],
        },
        errors,
      },
      () => {
        if (newSelection.name !== undefined) {
          this.updateCondition(condition);
        }
      }
    );
  };

  private validateCondition = (value: string) => {
    const {
      errors,
      detectionObj: { selections },
    } = this.state;
    value = value.trim();
    delete errors.fields['condition'];
    if (!value) {
      errors.fields['condition'] = 'Condition is required';
    } else {
      if (!validateCondition(value)) {
        errors.fields['condition'] = 'Invalid condition.';
      } else {
        const selectionNames = _.map(selections, 'name');
        const conditions = _.pull(value.split(' '), ...['and', 'or', 'not']);
        conditions.map((selection) => {
          if (_.indexOf(selectionNames, selection) === -1) {
            errors.fields[
              'condition'
            ] = `Invalid selection name ${selection}. Allowed names: "${selectionNames.join(
              ', '
            )}"`;
          }
        });
      }
    }

    errors.touched['condition'] = true;
    this.setState({
      errors,
    });
  };

  private updateCondition = (value: string) => {
    value = value.trim();

    const detectionObj = { ...this.state.detectionObj, condition: value } as DetectionObject;
    this.setState(
      {
        detectionObj,
      },
      () => {
        this.validateCondition(value);
      }
    );
  };

  private csvStringToArray = (
    csvString: string,
    delimiter: string = ',',
    numOfColumnsToReturn: number = 1
  ): string[] => {
    const rows = csvString.split('\n');
    return rows
      .map((row) => (!_.isEmpty(row) ? row.split(delimiter, numOfColumnsToReturn) : []))
      .flat();
  };

  private onFileUpload = (files: any, selectionIdx: number, dataIdx: number) => {
    if (
      files[0]?.size <= ONE_MEGA_BYTE &&
      (files[0]?.type === 'text/csv' || files[0]?.type === 'text/plain')
    ) {
      let reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = () => {
        try {
          const textContent = reader.result;
          if (typeof textContent === 'string') {
            const parsedContent =
              files[0]?.type === 'text/csv'
                ? this.csvStringToArray(textContent)
                : textContent.split('\n');
            this.updateDatumInState(selectionIdx, dataIdx, {
              values: parsedContent,
            });
          }
          this.setState({
            invalidFile: false,
          });
        } catch (error: any) {
        } finally {
          this.setState({ fileUploadModalState: undefined });
        }
      };
    } else {
      this.setState({
        invalidFile: true,
      });
    }
  };

  private closeFileUploadModal = () => {
    this.setState({
      fileUploadModalState: undefined,
      invalidFile: false,
    });
  };

  private createRadioGroupOptions = (selectionIdx: number, datumIdx: number) => {
    return [
      {
        id: `${SelectionMapValueRadioId.VALUE}-${selectionIdx}-${datumIdx}`,
        label: 'Value',
      },
      {
        id: `${SelectionMapValueRadioId.LIST}-${selectionIdx}-${datumIdx}`,
        label: 'List',
      },
    ];
  };

  private getTextareaHeight = (rowNo: number = 0) => {
    return `${rowNo * 25 + 40}px`;
  };

  render() {
    const {
      detectionObj: { condition, selections },
      fileUploadModalState,
      errors = {
        touched: {},
        fields: {},
      },
    } = this.state;

    return (
      <div style={{ maxWidth: 1000 }} className={'detection-visual-editor'}>
        {selections.map((selection, selectionIdx) => {
          return (
            <div key={`detection-visual-editor-selection-${selectionIdx}`}>
              <EuiPanel
                data-test-subj={`detection-visual-editor-${selectionIdx}`}
                key={`detection-visual-editor-${selectionIdx}`}
                className={'detection-visual-editor-selection'}
              >
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={true}>
                    <EuiFormRow
                      isInvalid={errors.touched.name && !!errors.fields.name}
                      error={errors.fields.name}
                    >
                      <EuiFieldText
                        className={'detection-visual-editor-name euiTitle--small'}
                        isInvalid={errors.touched.name && !!errors.fields.name}
                        placeholder="Enter selection name"
                        data-test-subj={'selection_name'}
                        onChange={(e) =>
                          this.updateSelection(selectionIdx, { name: e.target.value })
                        }
                        onBlur={(e) => this.updateSelection(selectionIdx, { name: e.target.value })}
                        value={selection.name}
                      />
                    </EuiFormRow>
                    <EuiText size="s">
                      <p>Define the search identifier in your data the rule will be applied to.</p>
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} className={'detection-visual-editor-delete-selection'}>
                    {selections.length > 1 && (
                      <EuiToolTip title={'Delete selection'}>
                        <EuiButtonIcon
                          aria-label={'Delete selection'}
                          iconType={'trash'}
                          color="danger"
                          onClick={() => {
                            const newSelections = [...selections];
                            newSelections.splice(selectionIdx, 1);
                            this.setState(
                              {
                                detectionObj: {
                                  condition,
                                  selections: newSelections,
                                },
                              },
                              () => this.updateCondition(condition)
                            );
                          }}
                        />
                      </EuiToolTip>
                    )}
                  </EuiFlexItem>
                </EuiFlexGroup>

                <EuiSpacer />

                {selection.data.map((datum, idx) => {
                  const radioGroupOptions = this.createRadioGroupOptions(selectionIdx, idx);
                  const fieldName = `field_${selectionIdx}_${idx}`;
                  const valueId = `value_${selectionIdx}_${idx}`;
                  return (
                    <div key={`Map-${idx}`} className={'detection-visual-editor-accordion-wrapper'}>
                      <EuiAccordion
                        className="euiAccordionForm detection-visual-editor-accordion"
                        buttonClassName="euiAccordionForm__button"
                        id={`Map-${idx}`}
                        key={`Map-${idx}`}
                        data-test-subj={`Map-${idx}`}
                        initialIsOpen={true}
                        buttonContent={<EuiText size="m">Map {idx + 1}</EuiText>}
                        extraAction={
                          selection.data.length > 1 ? (
                            <EuiToolTip title={'Delete map'}>
                              <EuiButtonIcon
                                aria-label={'Delete map'}
                                iconType={'trash'}
                                color="danger"
                                onClick={() => {
                                  const newData = [...selection.data];
                                  newData.splice(idx, 1);
                                  this.updateSelection(selectionIdx, { data: newData });
                                }}
                              />
                            </EuiToolTip>
                          ) : null
                        }
                        style={{ maxWidth: '70%' }}
                      >
                        <EuiSpacer size="m" />

                        <EuiFlexGroup>
                          <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                            <EuiFormRow
                              isInvalid={errors.touched[fieldName] && !!errors.fields[fieldName]}
                              error={errors.fields[fieldName]}
                              label={<EuiText size={'s'}>Key</EuiText>}
                            >
                              <EuiFieldText
                                isInvalid={errors.touched[fieldName] && !!errors.fields[fieldName]}
                                placeholder="Enter key name"
                                data-test-subj={'selection_field_key_name'}
                                onChange={(e) =>
                                  this.updateDatumInState(selectionIdx, idx, {
                                    field: e.target.value,
                                  })
                                }
                                onBlur={(e) =>
                                  this.updateDatumInState(selectionIdx, idx, {
                                    field: e.target.value,
                                  })
                                }
                                value={datum.field}
                              />
                            </EuiFormRow>
                          </EuiFlexItem>
                          <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                            <EuiFormRow label={<EuiText size={'s'}>Modifier</EuiText>}>
                              <EuiComboBox
                                data-test-subj={'modifier_dropdown'}
                                options={detectionModifierOptions}
                                singleSelection={{ asPlainText: true }}
                                onChange={(e) => {
                                  this.updateDatumInState(selectionIdx, idx, {
                                    modifier: e[0].value,
                                  });
                                }}
                                onBlur={() => {}}
                                selectedOptions={
                                  datum.modifier
                                    ? [{ value: datum.modifier, label: datum.modifier }]
                                    : [detectionModifierOptions[0]]
                                }
                              />
                            </EuiFormRow>
                          </EuiFlexItem>
                        </EuiFlexGroup>

                        <EuiSpacer size="m" />

                        <EuiRadioGroup
                          options={radioGroupOptions}
                          idSelected={datum.selectedRadioId || radioGroupOptions[0].id}
                          onChange={(id) => {
                            this.updateDatumInState(selectionIdx, idx, {
                              selectedRadioId: id as SelectionMapValueRadioId,
                            });
                          }}
                        />

                        <EuiSpacer size="m" />

                        {datum.selectedRadioId?.includes('list') ? (
                          <>
                            <EuiFlexGroup>
                              <EuiFlexItem grow={false}>
                                <EuiButton
                                  iconType="download"
                                  onClick={() => {
                                    this.setState({
                                      fileUploadModalState: {
                                        selectionIdx,
                                        dataIdx: idx,
                                      },
                                    });
                                  }}
                                >
                                  Upload file
                                </EuiButton>
                                <EuiSpacer size={'s'} />
                              </EuiFlexItem>

                              <EuiFlexItem
                                grow={true}
                                className={'detection-visual-editor-textarea-clear-btn'}
                              >
                                <EuiButtonEmpty
                                  isDisabled={!datum.values[0]}
                                  color={datum.values[0] ? 'primary' : 'ghost'}
                                  iconType={'cross'}
                                  onClick={() => {
                                    this.updateDatumInState(selectionIdx, idx, {
                                      values: [],
                                    });
                                  }}
                                >
                                  Clear list
                                </EuiButtonEmpty>
                                <EuiSpacer size={'s'} />
                              </EuiFlexItem>
                            </EuiFlexGroup>
                            <EuiFormRow
                              isInvalid={errors.touched[valueId] && !!errors.fields[valueId]}
                              error={errors.fields[valueId]}
                              className={'detection-visual-editor-form-row'}
                            >
                              <EuiTextArea
                                style={{
                                  maxWidth: '100%',
                                  minHeight: '80px',
                                  maxHeight: '200px',
                                  height: this.getTextareaHeight(datum.values.length),
                                }}
                                data-test-subj={'selection_field_list'}
                                className={'detection-visual-editor-textarea'}
                                onChange={(e) => {
                                  const values = e.target.value.split('\n');
                                  this.updateDatumInState(selectionIdx, idx, {
                                    values,
                                  });
                                }}
                                onBlur={(e) => {
                                  const values = e.target.value.split('\n');
                                  this.updateDatumInState(selectionIdx, idx, {
                                    values,
                                  });
                                }}
                                value={datum.values.join('\n')}
                                compressed={true}
                                isInvalid={errors.touched[valueId] && !!errors.fields[valueId]}
                              />
                            </EuiFormRow>
                          </>
                        ) : (
                          <EuiFormRow
                            isInvalid={errors.touched[valueId] && !!errors.fields[valueId]}
                            error={errors.fields[valueId]}
                          >
                            <EuiFieldText
                              isInvalid={errors.touched[valueId] && !!errors.fields[valueId]}
                              placeholder="Value"
                              data-test-subj={'selection_field_value'}
                              onChange={(e) => {
                                this.updateDatumInState(selectionIdx, idx, {
                                  values: [e.target.value, ...datum.values.slice(1)],
                                });
                              }}
                              onBlur={(e) => {
                                this.updateDatumInState(selectionIdx, idx, {
                                  values: [e.target.value, ...datum.values.slice(1)],
                                });
                              }}
                              value={datum.values[0]}
                            />
                          </EuiFormRow>
                        )}

                        <EuiSpacer size={'m'} />
                      </EuiAccordion>
                    </div>
                  );
                })}

                <EuiSpacer size={'m'} />

                <EuiButton
                  style={{ width: '70%' }}
                  iconType="plusInCircle"
                  onClick={() => {
                    const newData = [
                      ...selection.data,
                      { ...defaultDetectionObj.selections[0].data[0] },
                    ];
                    this.updateSelection(selectionIdx, { data: newData });
                  }}
                >
                  Add map
                </EuiButton>
              </EuiPanel>

              {selections.length > 1 && selections.length !== selectionIdx ? (
                <EuiSpacer size={'m'} />
              ) : null}
            </div>
          );
        })}

        <EuiSpacer size={'m'} />

        <EuiButton
          fullWidth
          iconType={'plusInCircle'}
          onClick={() => {
            this.setState({
              detectionObj: {
                condition,
                selections: [
                  ...selections,
                  {
                    ...defaultDetectionObj.selections[0],
                    name: `Selection_${selections.length + 1}`,
                  },
                ],
              },
            });
          }}
        >
          Add selection
        </EuiButton>

        <EuiSpacer />

        <EuiFormRow
          isInvalid={errors.touched.condition && !!errors.fields.condition}
          error={errors.fields.condition}
          style={{ maxWidth: '100%' }}
          label={
            <>
              <EuiTitle size="s">
                <p>Condition</p>
              </EuiTitle>
              <EuiText size="xs">
                Define how each selection should be included in the final query. For more options
                use{' '}
                <EuiButtonEmpty
                  className={'empty-text-button'}
                  onClick={() => this.props.goToYamlEditor('yaml')}
                >
                  <EuiText size="s">YAML editor</EuiText>
                </EuiButtonEmpty>
                .
              </EuiText>
            </>
          }
        >
          <SelectionExpField
            selections={this.state.detectionObj.selections}
            value={this.state.detectionObj.condition}
            onChange={this.updateCondition}
            dataTestSubj={'rule_detection_field'}
          />
        </EuiFormRow>

        {fileUploadModalState && (
          <EuiModal onClose={this.closeFileUploadModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>Upload a file</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              {selections[fileUploadModalState.selectionIdx].data[fileUploadModalState.dataIdx]
                .values[0] && (
                <>
                  <EuiCallOut
                    title="The list will be overriden with file content"
                    iconType="iInCircle"
                    color="warning"
                    size="s"
                  />
                  <EuiSpacer />
                </>
              )}
              {this.state.invalidFile && (
                <EuiText color="danger" size="s">
                  <p>Invalid file.</p>
                </EuiText>
              )}
              <EuiFilePicker
                id={'filePickerId'}
                fullWidth
                initialPromptText="Select or drag file containing list of values"
                onChange={(files: any) =>
                  this.onFileUpload(
                    files,
                    fileUploadModalState.selectionIdx,
                    fileUploadModalState.dataIdx
                  )
                }
                multiple={false}
                aria-label="file picker"
                isInvalid={this.state.invalidFile}
              />
              <EuiText color="subdued" size="xs">
                <p>Accepted formats: .csv, .txt. Maximum size: 1 MB.</p>
              </EuiText>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButton fill={true} onClick={this.closeFileUploadModal}>
                Close
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        )}
      </div>
    );
  }
}
