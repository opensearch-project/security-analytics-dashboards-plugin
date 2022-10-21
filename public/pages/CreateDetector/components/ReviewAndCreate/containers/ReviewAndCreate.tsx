/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../../components/ContentPanel';
import React from 'react';
import { createDetectorSteps } from '../../../utils/constants';
import { DetectorCreationStep } from '../../../models/types';

export interface ReviewAndCreateProps {}

export class ReviewAndCreate extends React.Component<ReviewAndCreateProps> {
  render() {
    return (
      <ContentPanel title={createDetectorSteps[DetectorCreationStep.REVIEW_CREATE].title}>
        {/* <DetectorDetailsReview />
            <FieldMappingReview />
            <AlertTriggersReview /> */}
      </ContentPanel>
    );
  }
}
