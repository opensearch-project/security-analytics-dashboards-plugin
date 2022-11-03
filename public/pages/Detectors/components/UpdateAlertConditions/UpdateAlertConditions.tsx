/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { DetectorHit } from '../../../../../server/models/interfaces';
import { Detector } from '../../../../../models/interfaces';
import ConfigureAlerts from '../../../CreateDetector/components/ConfigureAlerts';
import { DetectorsService, NotificationsService, RuleService } from '../../../../services';
import { RulesSharedState } from '../../../../models/interfaces';
import { ROUTES } from '../../../../utils/constants';

export interface UpdateAlertConditionsProps
  extends RouteComponentProps<any, any, { detectorHit: DetectorHit }> {
  detectorService: DetectorsService;
  ruleService: RuleService;
  notificationsService: NotificationsService;
}

export interface UpdateAlertConditionsState {
  detector: Detector;
  rules: object;
  rulesOptions: Pick<RulesSharedState, 'rulesOptions'>['rulesOptions'];
  submitting: boolean;
}

export default class UpdateAlertConditions extends Component<
  UpdateAlertConditionsProps,
  UpdateAlertConditionsState
> {
  constructor(props: UpdateAlertConditionsProps) {
    super(props);
    this.state = {
      detector: props.location.state.detectorHit._source,
      rules: {},
      rulesOptions: [],
      submitting: false,
    };
  }

  componentDidMount() {
    this.getRules();
  }

  changeDetector = (detector: Detector) => {
    this.setState({ detector: detector });
  };

  getRules = async () => {
    try {
      const { ruleService } = this.props;
      const { detector } = this.state;
      const body = {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              bool: {
                must: [{ match: { 'rule.category': detector.detector_type.toLowerCase() } }],
              },
            },
          },
        },
      };

      const prePackagedResponse = await ruleService.getRules(true, body);
      const customResponse = await ruleService.getRules(false, body);

      const allRules = {};
      const rulesOptions = new Set();

      if (prePackagedResponse.ok) {
        prePackagedResponse.response.hits.hits.forEach((hit) => {
          allRules[hit._id] = hit._source;
          const rule = allRules[hit._id];
          rulesOptions.add({
            name: rule.title,
            id: hit._id,
            severity: rule.level,
            tags: rule.tags.map((tag) => tag.value),
          });
        });
      } else {
        console.error('Failed to retrieve pre-packaged rules:', prePackagedResponse.error);
        // TODO: Display toast with error details
      }

      if (customResponse.ok) {
        customResponse.response.hits.hits.forEach((hit) => {
          allRules[hit._id] = hit._source;
          const rule = allRules[hit._id];
          rulesOptions.add({
            name: rule.title,
            id: hit._id,
            severity: rule.level,
            tags: rule.tags.map((tag) => tag.value),
          });
        });
      } else {
        console.error('Failed to retrieve custom rules:', customResponse.error);
        // TODO: Display toast with error details
      }

      this.setState({ rules: allRules, rulesOptions: Array.from(rulesOptions) });
    } catch (e) {
      console.error('Failed to retrieve rule:', e);
      // TODO: Display toast with error details
    }
  };

  onCancel = () => {
    this.props.history.replace({
      pathname: ROUTES.DETECTOR_DETAILS,
      state: this.props.location.state,
    });
  };

  onSave = async () => {
    this.setState({ submitting: true });
    const {
      history,
      location: {
        state: { detectorHit },
      },
      detectorService,
    } = this.props;
    const { detector } = this.state;

    try {
      const updateDetectorResponse = await detectorService.updateDetector(
        detectorHit._id,
        detector
      );
      if (!updateDetectorResponse.ok) {
        // TODO: show toast notification with error
        console.error('Failed to update detector: ', updateDetectorResponse.error);
      }
    } catch (e) {
      // TODO: show toast notification with error
      console.error('Failed to update detector: ', e);
    }

    this.setState({ submitting: false });
    history.replace({
      pathname: ROUTES.DETECTOR_DETAILS,
      state: {
        detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detector } },
      },
    });
  };

  render() {
    const { detector, rulesOptions, submitting } = this.state;
    return (
      <div>
        <ConfigureAlerts
          {...this.props}
          isEdit={true}
          detector={detector}
          rulesOptions={rulesOptions}
          changeDetector={this.changeDetector}
          updateDataValidState={() => {}}
        />

        <EuiFlexGroup justifyContent={'flexEnd'}>
          <EuiFlexItem grow={false}>
            <EuiButton disabled={submitting} onClick={this.onCancel}>
              Cancel
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              disabled={submitting}
              fill={true}
              isLoading={submitting}
              onClick={this.onSave}
            >
              Save changes
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
