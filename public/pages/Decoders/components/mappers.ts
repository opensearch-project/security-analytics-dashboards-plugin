import { DecoderDocument } from '../../../../types/Decoders';
import YAML from 'yaml';
import { LosslessNumber } from 'lossless-json';

export const decoderFormDefaultValue: string = `name: decoder/<name>/<version>
enabled: true
metadata:
  title: Placeholder Decoder
  description: This is a placeholder decoder. Please update the fields accordingly.
  author: User
  date: '${new Date().toISOString().split('T')[0]}'
  modified: '${new Date().toISOString().split('T')[0]}'
  references: []
  documentation: ''
  supports: []`;

// Convert yaml string to a decoder model with floats with decimal precision
export const mapYamlToLosslessDecoder = (yamlString: string): DecoderDocument => {
  const yamlObject = YAML.parseDocument(yamlString);

  YAML.visit(yamlObject, {
    Scalar(_, node) {
      if (typeof node.value === 'number') {
        let rawText;

        if (node.range && node.range.length >= 2) {
          rawText = yamlString.slice(node.range[0], node.range[1]).trim();
        }

        if (!rawText) {
          rawText = String(node.value);
          if (!rawText.includes('.')) rawText += '.0';
        }

        node.value = new LosslessNumber(rawText);
      }
    },
  });

  // Transform the yaml into an object with lossless numbers
  const decoderForm = yamlObject.toJS() as DecoderDocument;

  return decoderForm;
};
