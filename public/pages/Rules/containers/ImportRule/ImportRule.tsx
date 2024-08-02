/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditorContainer } from '../../components/RuleEditor/RuleEditorContainer';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { EuiSmallButton, EuiCompressedFilePicker, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { RouteComponentProps } from 'react-router-dom';
import { dump, load } from 'js-yaml';
import { ContentPanel } from '../../../../components/ContentPanel';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CoreServicesContext } from '../../../../components/core_services';
import { setBreadCrumb } from '../../utils/helpers';
import { Rule } from '../../../../../types';
import { DEFAULT_RULE_UUID } from '../../../../../common/constants';

export interface ImportRuleProps {
  services: BrowserServices;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
}

export const ImportRule: React.FC<ImportRuleProps> = ({ history, services, notifications }) => {
  const context = useContext(CoreServicesContext);
  const [fileError, setFileError] = useState('');
  const onChange = useCallback((files: FileList | null) => {
    setFileError('');

    if (!!files?.item(0)) {
      const reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = function () {
        try {
          const yamlContent: any = reader.result;

          if (!yamlContent) {
            setFileError('Invalid file content.');
            return;
          }

          const jsonContent: { [key: string]: any } = load(yamlContent) as object;

          if (!jsonContent) {
            setFileError('Invalid yaml content.');
            return;
          }

          let detectionYaml = '';
          if (jsonContent.detection) {
            detectionYaml = dump(jsonContent.detection);
          }

          const rule: Rule = {
            id: DEFAULT_RULE_UUID,
            category: '',
            title: jsonContent.title || '',
            description: jsonContent.description || '',
            status: jsonContent.status || '',
            author: jsonContent.author || '',
            references:
              jsonContent.references?.map((reference: string) => ({ value: reference })) || [],
            tags: jsonContent.tags?.map((tag: string) => ({ value: tag })) || [],
            log_source: jsonContent.logsource || {},
            detection: detectionYaml,
            level: jsonContent.level || '',
            false_positives:
              jsonContent.falsepositives?.map((falsePositive: string) => ({
                value: falsePositive,
              })) || [],
          };
          setContent(
            <RuleEditorContainer
              title="Import a rule"
              history={history}
              notifications={notifications}
              mode={'create'}
              rule={rule}
              validateOnMount={true}
            />
          );
        } catch (error: any) {
          setFileError('Invalid file content.');
        }
      };
    }
  }, []);

  const [content, setContent] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    setContent(
      <>
        <ContentPanel title="Import rule">
          <EuiCompressedFilePicker
            id={'filePickerId'}
            fullWidth
            initialPromptText="Select or drag yml file containing Sigma rules"
            onChange={onChange}
            display={'large'}
            multiple={false}
            aria-label="file picker"
            isInvalid={!!fileError}
            data-test-subj="import_rule_file_picker"
          />
          {fileError && <div style={{ color: 'red', margin: '0 auto' }}>Error: {fileError}</div>}
        </ContentPanel>
        <EuiSpacer size="xl" />
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiSmallButton onClick={() => history.replace(ROUTES.RULES)}>Cancel</EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
    setBreadCrumb(BREADCRUMBS.RULES_IMPORT, context?.chrome.setBreadcrumbs);
  }, [fileError, onChange]);

  return content;
};
