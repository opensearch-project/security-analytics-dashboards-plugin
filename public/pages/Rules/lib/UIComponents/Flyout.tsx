import React, { useState } from 'react';
import View from '../../containers/Rules/components/View';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter,
  EuiSelect,
} from '@elastic/eui';
import './index.scss';

export const Flyout = (props: any) => {
  const { close, content, type, ruleType } = props;

  console.log('17 - PROPS', props);

  const options = [
    { value: 'Actions', text: 'Actions' },
    { value: 'Edit', text: 'Edit' },
    { value: 'Duplicate', text: 'Duplicate' },
    { value: 'Delete', text: 'Delete' },
  ];

  const [value, setValue] = useState(options[0].value);

  const onChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    <EuiFlyout onClose={close} style={{ width: 800 }}>
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="m">
              <h3>{content.title}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <div>
              {props.content.source === 'custom' && (
                <EuiSelect
                  name="editMode"
                  options={options}
                  value={value}
                  onChange={(e) => onChange(e)}
                />
              )}
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <View content={content} ruleType={ruleType} />
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup direction="row" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={close} fill style={{ marginRight: '25px' }}>
              Close
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
