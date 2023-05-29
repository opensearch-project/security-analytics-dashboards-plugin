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
  const [usedExpressions, setUsedExpressions] = useState<UsedSelection[]>([]);

  useEffect(() => {
    let expressions: UsedSelection[] = [];
    if (value?.length) {
      const values = value.split(' ');
      let counter = 0;
      values.map((val, idx) => {
        if (idx === 0) {
          expressions.push({
            description: 'SELECTION',
            isOpen: false,
            name: val,
          });
        } else {
          if (idx % 2 !== 0) {
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
        }
      });
    } else {
      expressions = [
        {
          description: 'SELECTION',
          isOpen: false,
          name: selections[0]?.name || 'Selection_1',
        },
      ];
    }
    setUsedExpressions(expressions);
  }, [value]);

  useEffect(() => {
    console.log('XXX', usedExpressions, getValue());
    onChange(getValue());
  }, [usedExpressions]);

  const getValue = () => {
    const expressions = usedExpressions.map((exp) => [_.toLower(exp.description), exp.name]);
    let newExpressions = _.flattenDeep(expressions);
    newExpressions.shift();
    return newExpressions.join(' ');
  };

  const changeExtValue = (
    event: React.ChangeEvent<HTMLSelectElement>,
    exp: UsedSelection,
    idx: number
  ) => {
    const usedExp = _.cloneDeep(usedExpressions);
    usedExp[idx] = { ...usedExp[idx], name: event.target.value };
    setUsedExpressions(usedExp);
  };

  const changeExtDescription = (
    event: React.ChangeEvent<HTMLSelectElement>,
    exp: UsedSelection,
    idx: number
  ) => {
    const usedExp = _.cloneDeep(usedExpressions);
    usedExp[idx] = { ...usedExp[idx], description: event.target.value };
    setUsedExpressions(usedExp);
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
      {usedExpressions.map((exp, idx) => (
        <EuiFlexItem
          grow={false}
          key={`selections_${idx}`}
          className={idx > 0 ? 'selection-exp-field-item-with-remove' : 'selection-exp-field-item'}
        >
          <EuiPopover
            id={`selections_${idx}`}
            button={
              <EuiExpression
                aria-label={'Add condition expression'}
                description={exp.description}
                value={exp.name}
                isActive={exp.isOpen}
                onClick={() => openPopover(idx)}
              />
            }
            isOpen={exp.isOpen}
            closePopover={() => closePopover(idx)}
            panelPaddingSize="s"
            anchorPosition="rightDown"
          >
            {exp.description === 'SELECTION' ? renderSelections(exp, idx) : renderOptions(exp, idx)}
          </EuiPopover>
          {idx ? (
            <EuiButtonIcon
              className={'selection-exp-field-item-remove'}
              onClick={() => {
                const usedExp = _.cloneDeep(usedExpressions);
                usedExp.splice(idx, 1);
                setUsedExpressions([...usedExp]);
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
              setUsedExpressions([
                ...usedExp,
                {
                  description: 'AND',
                  isOpen: false,
                  name: differences[0]?.name,
                },
              ]);
            }}
            iconType="plusInCircle"
            aria-label={'Add one more condition'}
          />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};
