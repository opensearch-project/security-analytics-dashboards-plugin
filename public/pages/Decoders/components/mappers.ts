import { dump } from 'js-yaml';
import { DecoderDocument } from '../../../../types/Decoders';

export interface DecoderFormModel {
  id?: string;
  name: string;
  enabled?: boolean;
  metadata?: {
    author?: {
      date?: string;
      name?: string;
    };
    compatibility?: string;
    description?: string;
    module?: string;
    references?: string[];
    title?: string;
    versions?: string[];
  };
  normalize?: any[];
  description?: string;
  source?: string;
  program_name?: string;
  order?: number;
  fields?: Record<string, any>;
  parent?: string;
  regex?: string;
  prematch?: string;
  decoder?: any;
}

export const decoderFormDefaultValue: DecoderFormModel = {
  name: 'decoder/<name>/<version>',
  enabled: true,
  metadata: {
    title: 'Placeholder Decoder',
    description: 'This is a placeholder decoder. Please update the fields accordingly.',
    author: { name: 'User' },
  },
};

// Convert from DecoderDocument (API) to DecoderFormModel (form)
export const mapDecoderToForm = (decoder: any): DecoderFormModel => {
  const result: any = {
    name: decoder.name || '',
  };

  if (decoder.id !== undefined) result.id = decoder.id;
  if (decoder.enabled !== undefined) result.enabled = decoder.enabled;
  if (decoder.metadata !== undefined) result.metadata = decoder.metadata;
  if (decoder.normalize !== undefined) result.normalize = decoder.normalize;
  if (decoder.description !== undefined) result.description = decoder.description;
  if (decoder.source !== undefined) result.source = decoder.source;
  if (decoder.program_name !== undefined) result.program_name = decoder.program_name;
  if (decoder.order !== undefined) result.order = decoder.order;
  if (decoder.fields !== undefined) result.fields = decoder.fields;
  if (decoder.parent !== undefined) result.parent = decoder.parent;
  if (decoder.regex !== undefined) result.regex = decoder.regex;
  if (decoder.prematch !== undefined) result.prematch = decoder.prematch;
  if (decoder.decoder !== undefined) result.decoder = decoder.decoder;

  return result as DecoderFormModel;
};

// Convert from DecoderFormModel (form) to DecoderDocument (API)
export const mapFormToDecoder = (formState: DecoderFormModel): DecoderDocument => {
  const result: any = {};

  if (formState.id !== undefined) result.id = formState.id;
  if (formState.name !== undefined) result.name = formState.name;
  if (formState.enabled !== undefined) result.enabled = formState.enabled;
  if (formState.metadata !== undefined) result.metadata = formState.metadata;
  if (formState.normalize !== undefined) result.normalize = formState.normalize;
  if (formState.description !== undefined) result.description = formState.description;
  if (formState.source !== undefined) result.source = formState.source;
  if (formState.program_name !== undefined) result.program_name = formState.program_name;
  if (formState.order !== undefined) result.order = formState.order;
  if (formState.fields !== undefined) result.fields = formState.fields;
  if (formState.parent !== undefined) result.parent = formState.parent;
  if (formState.regex !== undefined) result.regex = formState.regex;
  if (formState.prematch !== undefined) result.prematch = formState.prematch;
  if (formState.decoder !== undefined) result.decoder = formState.decoder;

  return result as DecoderDocument;
};

export const mapDecoderToYamlObject = (decoder: DecoderFormModel): any => {
  return decoder;
};

export const mapYamlObjectToYamlString = (decoder: DecoderFormModel): string => {
  try {
    return dump(decoder);
  } catch (error: any) {
    console.warn('Security Analytics - Decoder Editor - Yaml dump', error);
    return '';
  }
};

export const mapYamlObjectToDecoder = (obj: any): DecoderFormModel => {
  return mapDecoderToForm(obj);
};
