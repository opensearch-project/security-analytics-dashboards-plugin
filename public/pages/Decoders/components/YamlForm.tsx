import React, { useRef, useState } from 'react';
import { DecoderDocument } from '../../../../types';
import { EuiCompressedFormRow, EuiCodeEditor, EuiSpacer, EuiText, EuiCallOut } from '@elastic/eui';
import FormFieldHeader from '../../../components/FormFieldHeader';
import { YamlEditorState } from '../../Rules/components/RuleEditor/components/YamlRuleEditorComponent/YamlRuleEditorComponent';
import { load } from 'js-yaml';
import {
  DecoderFormModel,
  mapDecoderToYamlObject,
  mapYamlObjectToDecoder,
  mapYamlObjectToYamlString,
} from './mappers';

interface YamlFormProps {
  decoder?: DecoderDocument;
  change: React.Dispatch<DecoderFormModel>;
  isInvalid: boolean;
  errors?: string[];
  parseDebounceMs?: number;
}

export const YamlForm: React.FC<YamlFormProps> = ({
  decoder,
  change,
  isInvalid,
  errors,
  parseDebounceMs = 500,
}) => {
  const yamlObject = mapDecoderToYamlObject(decoder);

  const [state, setState] = useState<YamlEditorState>({
    errors: null,
    value: mapYamlObjectToYamlString(yamlObject),
  });

  const isFocusedRef = useRef(false);

  const timerRef = useRef<number | null>(null);

  const onFocus = () => {
    isFocusedRef.current = true;
  };

  const tryParseAndNotify = (value: string) => {
    if (!value || value.trim() === '') {
      setState((prev) => ({ ...prev, errors: ['Decoder cannot be empty'] }));
      return;
    }
    try {
      const yamlObject = load(value);
      const parsedDecoder = mapYamlObjectToDecoder(yamlObject);
      change(parsedDecoder);
      setState((prev) => ({ ...prev, errors: null }));
    } catch (err) {
      setState((prev) => ({ ...prev, errors: ['Invalid YAML'] }));
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
      <EuiSpacer size="s" />
      <EuiCompressedFormRow
        label={<FormFieldHeader headerTitle={'Define decoder in YAML'} />}
        fullWidth={true}
      >
        <>
          <EuiSpacer />
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
