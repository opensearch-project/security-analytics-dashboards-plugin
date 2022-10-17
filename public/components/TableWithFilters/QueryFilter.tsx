import React, { Component } from 'react';

import {
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiSuggest,
  EuiSuperDatePicker,
} from '@elastic/eui';

import { GlobalFilterBar } from './GlobalFitlerBar';
import GlobalFilterOptions from './GlobalFilterOptions';
import HashtagPopover from './HashtagPopover';

const shortDescription = 'This is the description';

const sampleItems = [
  {
    type: { iconType: 'kqlField', color: 'tint4' },
    label: 'Field sample',
    description: shortDescription,
  },
  {
    type: { iconType: 'kqlValue', color: 'tint0' },
    label: 'Value sample',
    description: shortDescription,
  },
  {
    type: { iconType: 'kqlSelector', color: 'tint2' },
    label: 'Conjunction sample',
    description: shortDescription,
  },
  {
    type: { iconType: 'kqlOperand', color: 'tint1' },
    label: 'Operator sample',
    description: shortDescription,
  },
  {
    type: { iconType: 'search', color: 'tint8' },
    label: 'Recent search',
  },
  {
    type: { iconType: 'save', color: 'tint3' },
    label: 'Saved search',
  },
];

interface QueryFilterProps {
  showFilter: boolean;
}

interface QueryFilterState {
  hideDatepicker: boolean;
  value: string;
}

const filters = [
  {
    id: 'filter0',
    field: '@tags.keyword',
    operator: 'IS',
    value: 'value',
    isDisabled: false,
    isPinned: true,
    isExcluded: false,
  },
  {
    id: 'filter1',
    field:
      'Filter with a very long title to test if the badge will properly get truncated in the separate set of filter badges that are not quite as long but man does it really need to be long',
    operator: 'IS',
    value: 'value',
    isDisabled: true,
    isPinned: false,
    isExcluded: false,
  },
  {
    id: 'filter2',
    field: '@tags.keyword',
    operator: 'IS NOT',
    value: 'value',
    isDisabled: false,
    isPinned: true,
    isExcluded: true,
  },
  {
    id: 'filter3',
    field: '@tags.keyword',
    operator: 'IS',
    value: 'value',
    isDisabled: false,
    isPinned: false,
    isExcluded: false,
  },
];

const status = 'unchanged';
const append = <EuiButtonEmpty>KQL</EuiButtonEmpty>;

export default class QueryFilter extends Component<QueryFilterProps, QueryFilterState> {
  constructor(props: QueryFilterProps) {
    super(props);

    this.state = {
      value: '',
      hideDatepicker: false,
    };
  }

  onFieldFocus = () => {
    this.setState({ hideDatepicker: true });
  };

  onFieldBlur = () => {
    this.setState({ hideDatepicker: false });
  };

  getInputValue = (value: any) => {
    this.setState({ value });
  };

  onItemClick = (item: any) => {
    console.log(item);
  };

  onTimeChange = (dateRange: any) => {
    console.log(dateRange);
  };

  render() {
    const { hideDatepicker, value } = this.state;
    const { showFilter } = this.props;

    return (
      <div className="savedQueriesInput">
        <EuiFlexGroup
          gutterSize="s"
          className={hideDatepicker ? 'savedQueriesInput__hideDatepicker' : ''}
        >
          <EuiFlexItem>
            <EuiSuggest
              status={status}
              onFocus={this.onFieldFocus}
              onBlur={this.onFieldBlur}
              prepend={<HashtagPopover value={value} />}
              append={append}
              aria-label="Filter"
              suggestions={sampleItems}
              onItemClick={this.onItemClick}
              onInputChange={this.getInputValue}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false} className="savedQueriesInput__datepicker">
            <EuiSuperDatePicker onTimeChange={this.onTimeChange} />
          </EuiFlexItem>
        </EuiFlexGroup>
        {showFilter && (
          <EuiFlexGroup>
            <EuiFlexItem className="globalFilterGroup__branch" grow={false}>
              <GlobalFilterOptions />
            </EuiFlexItem>
            <EuiFlexItem className="globalFilterGroup__filterFlexItem">
              <GlobalFilterBar className="globalFilterGroup__filterBar" filters={filters} />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        <EuiHorizontalRule />
      </div>
    );
  }
}
