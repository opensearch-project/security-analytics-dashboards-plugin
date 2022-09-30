import React, { useState } from 'react';
import {
  EuiButton,
  EuiTextArea,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiSwitch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiText,
} from '@elastic/eui';

export const Form = () => {
  const [value, setValue] = useState('');

  const onTextAreaChange = (e: any) => {
    setValue(e.target.value);
  };
  const [isSwitchChecked, setIsSwitchChecked] = useState(false);

  const onSwitchChange = () => {
    setIsSwitchChecked(!isSwitchChecked);
  };

  return (
    <EuiForm component="form">
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '15px' }}>
          <EuiButton color="primary">Visual Editor</EuiButton>
        </div>
        <div>
          <EuiButton color="secondary">YAML Editor</EuiButton>
        </div>
      </div>

      <EuiSpacer size="m" />

      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Rule name">
            <EuiFieldText name="ruleName" />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            label="Rule type"
            // labelAppend={
            //   <EuiText size='xs'>
            //     <EuiLink>Link to some help</EuiLink>
            //   </EuiText>
            // }
          >
            <EuiSelect
              hasNoInitialSelection={false}
              onChange={() => {}}
              options={[
                { value: 'option_one', text: 'Custom' },
                { value: 'option_one', text: 'Application' },
                { value: 'option_two', text: 'Apt' },
                { value: 'option_three', text: 'Cloud' },
                { value: 'option_three', text: 'Compliance' },
                { value: 'option_three', text: 'Linux' },
                { value: 'option_three', text: 'macOS' },
                { value: 'option_three', text: 'Network' },
                { value: 'option_three', text: 'Proxy' },
                { value: 'option_three', text: 'Web' },
                { value: 'option_three', text: 'Windows' },
              ]}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />

      <EuiFormRow label="Description">
        <EuiFieldText name="description" />
      </EuiFormRow>

      <EuiSpacer />

      <EuiTextArea
        placeholder="Placeholder text"
        aria-label="Use aria labels when no actual label is in use"
        fullWidth={true}
        value={value}
        onChange={(e) => onTextAreaChange(e)}
      />

      <EuiSpacer />

      <EuiSelect
        hasNoInitialSelection
        onChange={() => {}}
        options={[
          { value: 'option_one', text: 'Option One' },
          { value: 'option_two', text: 'Option Two' },
          { value: 'option_three', text: 'Option Three' },
        ]}
      />

      <EuiSpacer />

      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Tags">
            <EuiFieldText name="tag1" />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Tags">
            <EuiFieldText name="tag2" />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />

      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Tags">
            <EuiFieldText name="tag1" />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Tags">
            <EuiFieldText name="tag2" />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />

      <EuiSwitch
        name="switch"
        label="Enabled"
        checked={isSwitchChecked}
        onChange={onSwitchChange}
      />

      <EuiSpacer />

      <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton fill color="ghost">
            Cancel
          </EuiButton>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiButton type="submit" fill>
            Save
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
};
