import { dump } from 'js-yaml';
import { DecoderDocument, DecoderMetadata } from '../../../../types/Decoders';

export interface DecoderFormModel {
  id?: string;
  name: string;
  enabled?: boolean;
  metadata?: Partial<DecoderMetadata>;
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
  check?: any;
  parents?: string[];
}

export const decoderFormDefaultValue: DecoderFormModel = {
  name: 'decoder/<name>/<version>',
  enabled: true,
  metadata: {
    title: 'Placeholder Decoder',
    description: 'This is a placeholder decoder. Please update the fields accordingly.',
    author: 'User',
    date: new Date().toISOString().split('T')[0],
    modified: new Date().toISOString().split('T')[0],
    references: [],
    documentation: '',
    supports: [],
  },
};

const rootDecoderFields: (keyof DecoderFormModel)[] = [
  'id',
  'name',
  'enabled',
  'metadata',
  'normalize',
  'description',
  'source',
  'program_name',
  'order',
  'fields',
  'parent',
  'regex',
  'prematch',
  'decoder',
  'check',
  'parents',
];

// Convert from DecoderDocument (API) to DecoderFormModel (form)
export const mapDecoderToForm = (decoder: any): DecoderFormModel => {
  const result: any = {
    name: decoder.name || '',
  };

  // TODO: avoid selecting props and allow to send all the data and handle it in the backend, this is to make sure we don't miss any new fields added in the future, but for now we want to be explicit about which fields we are using in the form.
  rootDecoderFields
    .filter((key) => key !== 'name')
    .forEach((field) => {
      if (decoder[field] !== undefined) {
        result[field] = decoder[field];
      }
    });

  Object.keys(decoder)
    .filter((key) => /parse\|\S+/.test(key))
    .forEach((key) => {
      if (decoder[key as keyof DecoderFormModel] !== undefined) {
        result[key] = decoder[key as keyof DecoderFormModel];
      }
    });

  return result as DecoderFormModel;
};

// Convert from DecoderFormModel (form) to DecoderDocument (API)
export const mapFormToDecoder = (formState: DecoderFormModel): DecoderDocument => {
  const result: any = {};

  // TODO: avoid selecting props and allow to send all the data and handle it in the backend, this is to make sure we don't miss any new fields added in the future, but for now we want to be explicit about which fields we are using in the form.
  rootDecoderFields.forEach((field) => {
    if (formState[field as keyof DecoderFormModel] !== undefined) {
      result[field] = formState[field as keyof DecoderFormModel];
    }
  });

  Object.keys(formState)
    .filter((key) => /parse\|\S+/.test(key))
    .forEach((key) => {
      if (formState[key as keyof DecoderFormModel] !== undefined) {
        result[key] = formState[key as keyof DecoderFormModel];
      }
    });

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
