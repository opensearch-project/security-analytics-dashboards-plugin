import React, { useCallback, useEffect, useState } from 'react';
import {
  EuiPopoverTitle,
  EuiFlexItem,
  EuiFlexGroup,
  EuiPopover,
  EuiSelect,
  EuiSmallButtonIcon,
  EuiExpression,
} from '@elastic/eui';
import _ from 'lodash';
import { Selection } from '../DetectionVisualEditor';

export interface SelectionExpFieldProps {
  selections: Selection[];
  dataTestSubj: string;
  onChange: (value: string) => void;
  value: string;
}

interface UsedSelection {
  isOpen: boolean;
  name: string;
  description: string;
}

const operationOptionsFirstExpression = [
  { value: '', text: '' },
  { value: 'not', text: 'NOT' },
];

const operatorOptions = [
  { value: '', text: '' },
  { value: 'and', text: 'AND' },
  { value: 'or', text: 'OR' },
  { value: 'and not', text: 'AND NOT' },
  { value: 'or not', text: 'OR NOT' },
];

export const SelectionExpField: React.FC<SelectionExpFieldProps> = ({
  selections,
  dataTestSubj,
  onChange,
  value,
}) => {
  const DEFAULT_DESCRIPTION = 'Select';
  const OPERATORS = ['and', 'or', 'and not', 'or not', 'not'];
  const [usedExpressions, setUsedExpressions] = useState<UsedSelection[]>([]);

  useEffect(() => {
    let expressions: UsedSelection[] = [];
    if (value?.length) {
      const temp = value.split('and not');
      let values = temp
        .map((_) => {
          return _.trim()
            .split('or not')
            .map((leaf) => leaf.split(' '))
            .reduce((prev, curr) => {
              return [...prev, 'or not', ...curr];
            });
        })
        .reduce((prev, curr) => {
          return [...prev, 'and not', ...curr];
        });

      if (OPERATORS.indexOf(values[0]) === -1) values = ['', ...values];

      let counter = 0;
      values.map((val, idx) => {
        if (idx % 2 === 0) {
          expressions.push({
            description: val,
            isOpen: false,
            name: '',
          });
          counter++;
        } else {
          const currentIndex = idx - counter;
          expressions[currentIndex] = { ...expressions[currentIndex], name: val };
        }
      });
    } else {
      expressions = [];
    }

    setUsedExpressions(expressions);
    expressions.length && onChange(getValue(expressions));
  }, [value]);

  const getValue = (usedExp: UsedSelection[]) => {
    const expressions = usedExp.map((exp) => [_.toLower(exp.description), exp.name]);
    return _.flattenDeep(expressions).join(' ');
  };

  const changeExtValue = (
    event: React.ChangeEvent<HTMLSelectElement>,
    exp: UsedSelection,
    idx: number
  ) => {
    const usedExp = _.cloneDeep(usedExpressions);
    usedExp[idx] = { ...usedExp[idx], name: event.target.value };
    setUsedExpressions(usedExp);
    onChange(getValue(usedExp));
  };

  const changeExtDescription = (
    event: React.ChangeEvent<HTMLSelectElement>,
    exp: UsedSelection,
    idx: number
  ) => {
    const usedExp = _.cloneDeep(usedExpressions);
    usedExp[idx] = { ...usedExp[idx], description: event.target.value };
    setUsedExpressions(usedExp);
    onChange(getValue(usedExp));
  };

  const openPopover = (idx: number) => {
    const usedExp = _.cloneDeep(usedExpressions);
    usedExp[idx] = { ...usedExp[idx], isOpen: !usedExp[idx].isOpen };
    setUsedExpressions(usedExp);
  };

  const closePopover = (idx: number) => {
    const usedExp = _.cloneDeep(usedExpressions);
    usedExp[idx] = { ...usedExp[idx], isOpen: false };
    setUsedExpressions(usedExp);
  };

  const renderOptions = (exp: UsedSelection, idx: number) => (
    <div>
      <EuiFlexGroup gutterSize="s" data-test-subj={dataTestSubj}>
        <EuiFlexItem grow={false}>
          <EuiPopoverTitle>Selection</EuiPopoverTitle>
          <EuiSelect
            compressed
            value={exp.description}
            onChange={(e) => changeExtDescription(e, exp, idx)}
            options={idx === 0 ? operationOptionsFirstExpression : operatorOptions}
          />
        </EuiFlexItem>
        {selections.length > usedExpressions.length && (
          <EuiFlexItem grow={false}>{renderSelections(exp, idx)}</EuiFlexItem>
        )}
      </EuiFlexGroup>
    </div>
  );

  const renderSelections = (exp: UsedSelection, idx: number) => (
    <div>
      <EuiPopoverTitle>Selections</EuiPopoverTitle>
      <EuiSelect
        compressed
        onChange={(e) => changeExtValue(e, exp, idx)}
        value={exp.name}
        options={(() => {
          const differences = _.differenceBy(selections, usedExpressions, 'name');
          return [
            {
              value: exp.name,
              text: exp.name,
            },
            ...differences.map((sel) => ({
              value: sel.name,
              text: sel.name,
            })),
          ];
        })()}
      />
    </div>
  );

  const onSelectionPopup = (e: Event, idx: number) => {
    e.preventDefault();
    openPopover(idx);
  };

  const onRemoveSelection = (idx: number) => {
    const usedExp = _.cloneDeep(usedExpressions);
    usedExp.splice(idx, 1);
    usedExp.length && (usedExp[0].description = '');
    setUsedExpressions([...usedExp]);
    onChange(getValue(usedExp));
  };

  const onAddSelection = useCallback(() => {
    const usedExp = _.cloneDeep(usedExpressions);
    const differences = _.differenceBy(selections, usedExp, 'name');
    const exp = [
      ...usedExp,
      {
        description: usedExpressions.length ? 'AND' : '',
        isOpen: false,
        name: differences[0]?.name,
      },
    ];
    setUsedExpressions(exp);
    onChange(getValue(exp));
  }, [usedExpressions, selections]);

  return (
    <EuiFlexGroup gutterSize="s" data-test-subj={dataTestSubj}>
      {!usedExpressions.length && (
        <EuiFlexItem grow={false} key={`selections_default`}>
          <EuiPopover
            id={`selections_default`}
            button={
              <EuiExpression
                description={DEFAULT_DESCRIPTION}
                value={''}
                isActive={false}
                uppercase={false}
              />
            }
            isOpen={false}
            panelPaddingSize="s"
            anchorPosition="rightDown"
            closePopover={() => {}}
          />
        </EuiFlexItem>
      )}
      {usedExpressions.map((exp, idx) => (
        <EuiFlexItem
          grow={false}
          key={`selections_${idx}`}
          className={'selection-exp-field-item-with-remove'}
        >
          <EuiPopover
            id={`selections_${idx}`}
            button={
              <EuiExpression
                aria-label={'Add condition expression'}
                description={exp.description}
                value={exp.name}
                isActive={exp.isOpen}
                onClick={(e: any) => onSelectionPopup(e, idx)}
              />
            }
            isOpen={exp.isOpen}
            closePopover={() => closePopover(idx)}
            panelPaddingSize="s"
            anchorPosition="rightDown"
          >
            {renderOptions(exp, idx)}
          </EuiPopover>
          <EuiSmallButtonIcon
            data-test-subj={`selection-exp-field-item-remove-${idx}`}
            className={'selection-exp-field-item-remove'}
            onClick={() => onRemoveSelection(idx)}
            color={'danger'}
            iconType="cross"
            aria-label={'Remove condition'}
            key={idx}
          />
        </EuiFlexItem>
      ))}
      {selections.length > usedExpressions.length && (
        <EuiFlexItem grow={false} key={`selections_add`}>
          <EuiSmallButtonIcon
            onClick={onAddSelection}
            color={'primary'}
            iconType="plusInCircleFilled"
            aria-label={'Add one more condition'}
            data-test-subj={'condition-add-selection-btn'}
          />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};
