import React from 'react';
import ReactDOM from 'react-dom';

import Editor from '@monaco-editor/react';

export const YAML = () => {
  return (
    <div>
      <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment" />
    </div>
  );
};
