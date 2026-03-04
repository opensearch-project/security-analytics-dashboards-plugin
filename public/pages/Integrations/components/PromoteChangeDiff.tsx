import React from 'react';
import { EuiText, EuiTextColor } from '@elastic/eui';
import { PromoteOperations } from '../../../../types';

const colorOperationMap: Record<PromoteOperations, string> = {
  add: 'success',
  update: 'accent',
  remove: 'danger',
};

export const PromoteChangeDiff: React.FC<{ name: string; operation: PromoteOperations }> = ({
  name,
  operation,
}) => {
  return (
    <EuiText size="s">
      {name}{' '}
      <EuiTextColor color={colorOperationMap[operation] || 'subdued'}>({operation})</EuiTextColor>
    </EuiText>
  );
};
