import React, { useEffect, useState } from 'react';
import {
  EuiPopoverTitle,
  EuiFlexItem,
  EuiFlexGroup,
  EuiPopover,
  EuiSelect,
  EuiButtonIcon,
  EuiExpression,
} from '@elastic/eui';
import * as _ from 'lodash';
import { Selection } from '../DetectionVisualEditor';

interface SelectionExpFieldProps {
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

export const SelectionExpField: React.FC<SelectionExpFieldProps> = ({
  selections,
  dataTestSubj,
  onChange,
  value,
}) => {
  const DEFAULT_DESCRIPTION = 'CONDITION: ';
  const OPERATORS = ['and', 'or', 'not'];
  const [usedExpressions, setUsedExpressions] = useState<UsedSelection[]>([]);

  useEffect(() => {
    let expressions: UsedSelection[] = [];
    if (value?.length) {
      let values = value.split(' ');
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
      expressions = [
        {
          description: '',
          isOpen: false,
          name: selections[0]?.name || 'Selection_1',
        },
      ];
    }

    setUsedExpressions(expressions);
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
            options={[
              { value: '', text: '' },
              { value: 'and', text: 'AND' },
              { value: 'or', text: 'OR' },
              { value: 'not', text: 'NOT' },
            ]}
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

  return (
    <EuiFlexGroup gutterSize="s" data-test-subj={dataTestSubj}>
      <EuiFlexItem grow={false} key={`selections_default`}>
        <EuiPopover
          id={`selections_default`}
          button={<EuiExpression description={DEFAULT_DESCRIPTION} value={''} isActive={false} />}
          isOpen={false}
          panelPaddingSize="s"
          anchorPosition="rightDown"
        />
      </EuiFlexItem>
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
                onClick={(e: any) => {
                  e.preventDefault();
                  openPopover(idx);
                }}
              />
            }
            isOpen={exp.isOpen}
            closePopover={() => closePopover(idx)}
            panelPaddingSize="s"
            anchorPosition="rightDown"
          >
            {renderOptions(exp, idx)}
          </EuiPopover>
          {usedExpressions.length > 1 ? (
            <EuiButtonIcon
              className={'selection-exp-field-item-remove'}
              onClick={() => {
                const usedExp = _.cloneDeep(usedExpressions);
                usedExp.splice(idx, 1);
                setUsedExpressions([...usedExp]);
                onChange(getValue(usedExp));
              }}
              color={'danger'}
              iconType="cross"
              aria-label={'Remove condition'}
            />
          ) : null}
        </EuiFlexItem>
      ))}
      {selections.length > usedExpressions.length && (
        <EuiFlexItem grow={false} key={`selections_add`}>
          <EuiButtonIcon
            onClick={() => {
              const usedExp = _.cloneDeep(usedExpressions);
              const differences = _.differenceBy(selections, usedExp, 'name');
              const exp = [
                ...usedExp,
                {
                  description: 'AND',
                  isOpen: false,
                  name: differences[0]?.name,
                },
              ];
              setUsedExpressions(exp);
              onChange(getValue(exp));
            }}
            iconType="plusInCircle"
            aria-label={'Add one more condition'}
          />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};
