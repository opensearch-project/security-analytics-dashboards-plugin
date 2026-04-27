import React, { useRef, useState } from 'react';
import { EuiCompressedFormRow, EuiCodeEditor, EuiSpacer, EuiText, EuiCallOut } from '@elastic/eui';
import FormFieldHeader from '../../../components/FormFieldHeader';
import { YamlEditorState } from '../../Rules/components/RuleEditor/components/YamlRuleEditorComponent/YamlRuleEditorComponent';

interface YamlFormProps {
  rawDecoder: string;
  change: React.Dispatch<string>;
  isInvalid: boolean;
  errors?: string[];
  parseDebounceMs?: number;
  onErrors?: (errors: string[] | null) => void;
}

export const YamlForm: React.FC<YamlFormProps> = ({
  rawDecoder,
  change,
  isInvalid,
  errors,
  parseDebounceMs = 500,
  onErrors,
}) => {
  const [state, setState] = useState<YamlEditorState>({
    errors: null,
    value: rawDecoder ?? '',
  });

  const isFocusedRef = useRef(false);

  const timerRef = useRef<number | null>(null);

  const onFocus = () => {
    isFocusedRef.current = true;
  };

  const tryParseAndNotify = (value: string) => {
    if (!value || value.trim() === '') {
      const localErrors = ['Decoder cannot be empty'];
      setState((prev) => ({ ...prev, errors: localErrors }));
      onErrors?.(localErrors);
      return;
    }
    try {
      change(value);
      setState((prev) => ({ ...prev, errors: null }));
      onErrors?.(null);
    } catch (err) {
      const localErrors = ['Invalid YAML'];
      setState((prev) => ({ ...prev, errors: localErrors }));
      onErrors?.(localErrors);
      console.warn('Security Analytics - Decoder Editor - Yaml load', err);
    }
  };

  const onChangeYaml = (value: string) => {
    setState((prev) => ({ ...prev, value }));
    // debounce parse
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      tryParseAndNotify(value);
    }, parseDebounceMs);
  };

  const renderErrors = () => {
    if (state.errors && state.errors.length > 0) {
      return (
        <EuiCallOut size="m" color="danger" title="Please address the highlighted errors.">
          <ul>
            {state.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </EuiCallOut>
      );
    } else if (isInvalid && errors && errors.length > 0) {
      return (
        <EuiCallOut size="m" color="danger" title="Please address the highlighted errors.">
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </EuiCallOut>
      );
    } else {
      return null;
    }
  };

  return (
    <>
      {renderErrors()}
      <EuiCompressedFormRow
        label={<FormFieldHeader headerTitle={'Define decoder in YAML'} />}
        fullWidth={true}
      >
        <>
          <EuiText size="s" color="subdued">
            Use the YAML editor to define a custom decoder.
          </EuiText>
          <EuiSpacer size="s" />
          <EuiCodeEditor
            mode="yaml"
            width="100%"
            value={state.value}
            onChange={onChangeYaml}
            onFocus={onFocus}
            data-test-subj={'yaml_editor'}
          />
        </>
      </EuiCompressedFormRow>
    </>
  );
};
