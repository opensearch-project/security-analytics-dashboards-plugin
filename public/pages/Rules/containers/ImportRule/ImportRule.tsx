/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditorContainer } from '../../components/RuleEditor/RuleEditorContainer';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { EuiButton, EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { Rule } from '../../../../../models/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { dump, load } from 'js-yaml';
import { ContentPanel } from '../../../../components/ContentPanel';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CoreServicesContext } from '../../../../components/core_services';
import { setBreadCrumb, validateRule } from '../../utils/helpers';
import { DataStore } from '../../../../store/DataStore';

export interface ImportRuleProps {
  services: BrowserServices;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
}

export const ImportRule: React.FC<ImportRuleProps> = ({ history, services, notifications }) => {
  const context = useContext(CoreServicesContext);
  const [fileError, setFileError] = useState('');
  const onChange = useCallback((files: any) => {
    setFileError('');

    if (files[0]?.type === 'application/x-yaml') {
      let reader = new FileReader();
      reader.readAsText(files[0]);
      reader.onload = function () {
        try {
          const yamlContent: any = reader.result;

          if (!yamlContent) {
            setFileError('Invalid content in file');
            return;
          }

          const jsonContent = load(yamlContent);

          if (!jsonContent) {
            setFileError('Invalid yaml content');
            return;
          }

          let detectionYaml = '';
          if (jsonContent.detection) {
            detectionYaml = dump(jsonContent.detection);
          }

          const rule: Rule = {
            id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
            category: '',
            title: jsonContent.title || '',
            description: jsonContent.description || '',
            status: jsonContent.status || '',
            author: jsonContent.author || '',
            references:
              jsonContent.references?.map((reference: string) => ({ value: reference })) || [],
            tags: jsonContent.tags?.map((tag: string) => ({ value: tag })) || [],
            log_source: jsonContent.logsource || '',
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
            />
          );
        } catch (error: any) {
          setFileError('Invalid file content');
        }
      };
    } else {
      setFileError(files.length > 0 ? 'Only yaml files are accepted' : '');
    }
  }, []);

  const [content, setContent] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    setContent(
      <>
        <ContentPanel title="Import rule">
          <EuiFilePicker
            id={'filePickerId'}
            fullWidth
            initialPromptText="Select or drag yml file containing Sigma rules"
            onChange={onChange}
            display={'large'}
            multiple={false}
            aria-label="file picker"
            isInvalid={!!fileError}
          />
          {fileError && <div style={{ color: 'red', margin: '0 auto' }}>Error: {fileError}</div>}
        </ContentPanel>
        <EuiSpacer size="xl" />
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={() => history.replace(ROUTES.RULES)}>Cancel</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
    setBreadCrumb(BREADCRUMBS.RULES_IMPORT, context?.chrome.setBreadcrumbs);
  }, [fileError, onChange]);

  const footerActions: React.FC<{ rule: Rule }> = ({ rule }) => {
    const onCreate = async () => {
      if (!validateRule(rule, notifications!, 'create')) {
        return;
      }
      const response = await DataStore.rules.createRule(rule);

      if (response) {
        history.replace(ROUTES.RULES);
      }
    };

    return (
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => history.replace(ROUTES.RULES)}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={onCreate}>
            Create
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  return content;
};
