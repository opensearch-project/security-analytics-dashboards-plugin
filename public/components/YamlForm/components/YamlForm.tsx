import React, { useRef, useState } from 'react';
import { EuiCompressedFormRow, EuiCodeEditor, EuiSpacer, EuiText, EuiCallOut } from '@elastic/eui';
import FormFieldHeader from '../../FormFieldHeader';
import { YamlEditorState, YAML_TYPE } from '../utils/constants';

interface YamlFormProps {
  type: YAML_TYPE;
  value: string | undefined;
  change: React.Dispatch<string>;
  isInvalid: boolean;
  errors?: string[];
  parseDebounceMs?: number;
}

export const YamlForm: React.FC<YamlFormProps> = ({
  type,
  value,
  change,
  isInvalid,
  errors,
  parseDebounceMs = 500,
}) => {
  const [state, setState] = useState<YamlEditorState>({
    errors: null,
    value: value ?? '',
  });

  const isFocusedRef = useRef(false);

  const timerRef = useRef<number | null>(null);

  const onFocus = () => {
    isFocusedRef.current = true;
  };

  const tryParseAndNotify = (text: string) => {
    if (!text || text.trim() === '') {
      setState((prev) => ({ ...prev, errors: [`${type} cannot be empty`] }));
      return;
    }
    try {
      change(text);
      setState((prev) => ({ ...prev, errors: null }));
    } catch (err) {
      setState((prev) => ({ ...prev, errors: ['Invalid YAML'] }));
      console.warn(`Security Analytics - ${type} Editor - Yaml load`, err);
    }
  };

  const onChangeYaml = (text: string) => {
    setState((prev) => ({ ...prev, value: text }));
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => tryParseAndNotify(text), parseDebounceMs);
  };

  const renderErrors = () => {
    const callout = (errs: string[]) => (
      <EuiCallOut size="m" color="danger" title="Please address the highlighted errors.">
        <ul>
          {errs.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </EuiCallOut>
    );

    if (state.errors && state.errors.length > 0) return callout(state.errors);
    if (isInvalid && errors && errors.length > 0) return callout(errors);
    return null;
  };

  return (
    <>
      {renderErrors()}
      <EuiSpacer size="s" />
      <EuiCompressedFormRow
        label={<FormFieldHeader headerTitle={`Define ${type} in YAML`} />}
        fullWidth={true}
      >
        <>
          <EuiSpacer />
          <EuiText size="s" color="subdued">
            Use the YAML editor to define a custom {type}.
          </EuiText>
          <EuiSpacer size="s" />
          <EuiCodeEditor
            mode="yaml"
            width="100%"
            value={state.value}
            onChange={onChangeYaml}
            onFocus={onFocus}
            data-test-subj="yaml_editor"
          />
        </>
      </EuiCompressedFormRow>
    </>
  );
};
