import React, { useState, useEffect, useCallback } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { Form, Formik, FormikErrors } from 'formik';
import { decoderFormDefaultValue, mapYamlToLosslessDecoder } from '../components/mappers';
import { YamlForm } from '../components/YamlForm';
import {
  errorNotificationToast,
  setBreadcrumbs,
  successNotificationToast,
} from '../../../utils/helpers';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import {
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
  EuiPanel,
  EuiText,
  EuiSpacer,
  EuiButtonGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiToolTip,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import {
  IntegrationComboBox,
  useIntegrationSelector,
} from '../../../components/IntegrationComboBox';
import { DecoderDocument } from '../../../../types/Decoders';
import { DataStore } from '../../../store/DataStore';
import { RouteComponentProps } from 'react-router-dom';
import { validate } from 'joi';

const editorTypes = [
  {
    id: 'yaml',
    label: 'YAML Editor',
  },
];

type DecoderFormPageProps = {
  notifications: NotificationsStart;
  history: RouteComponentProps['history'];
  location?: RouteComponentProps['location'];
  action: 'create' | 'edit';
  id?: string;
  match: { params: { id: string } };
};

const actionLabels: Record<string, string> = {
  create: 'Create',
  edit: 'Edit',
};

export const DecoderFormPage: React.FC<DecoderFormPageProps> = (props) => {
  const { notifications, history, action } = props;
  const idDecoder = props.match.params.id;
  const spaceDecoder = new URLSearchParams(props.location?.search).get('space') ?? '';
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEditorType, setSelectedEditorType] = useState('yaml');
  const [integrationType, setIntegrationType] = useState<string>('');
  const [rawDecoder, setRawDecoder] = useState<string>(decoderFormDefaultValue);
  const [decoder, setDecoder] = useState<DecoderDocument>();
  const [hasYamlErrors, setHasYamlErrors] = useState(false);

  const {
    loading: loadingIntegrations,
    options: integrationTypeOptions,
    refresh: refreshIntegrations,
  } = useIntegrationSelector({ notifications });

  useEffect(() => {
    const fetchDecoder = async () => {
      if (idDecoder) {
        setIsLoading(true);
        try {
          const response = await DataStore.decoders.getDecoder(idDecoder, spaceDecoder);
          setRawDecoder(response?.decoder ?? decoderFormDefaultValue);
          setDecoder(mapYamlToLosslessDecoder(response?.decoder ?? ''));
          setIntegrationType(response?.integrations?.[0] || '');
          setBreadcrumbs([
            BREADCRUMBS.NORMALIZATION,
            BREADCRUMBS.DECODERS,
            BREADCRUMBS.DECODERS_EDIT,
            { text: response?.document.name },
          ]);
        } catch (error) {
          errorNotificationToast(
            notifications,
            'retrieve',
            'decoder',
            `There was an error retrieving the decoder with id ${idDecoder}.`
          );
        } finally {
          setIsLoading(false);
        }
      }
    };
    if (action === 'edit') {
      fetchDecoder();
    }
  }, [action, idDecoder, notifications]);

  useEffect(() => {
    if (action === 'create') {
      setBreadcrumbs([
        BREADCRUMBS.NORMALIZATION,
        BREADCRUMBS.DECODERS,
        BREADCRUMBS.DECODERS_CREATE,
      ]);
    }
  }, [action]);

  const onChange = useCallback((options: Array<{ id?: string }>) => {
    setIntegrationType(options[0]?.id || '');
  }, []);

  const onIntegrationCreateSuccess = useCallback(
    (newOption: { id: string }) => {
      refreshIntegrations();
      setIntegrationType(newOption.id);
    },
    [refreshIntegrations]
  );

  const createDecoder = useCallback(
    async (values: DecoderDocument) => {
      if (!values || !integrationType) {
        errorNotificationToast(
          notifications,
          'retrieve',
          'decoder',
          'Decoder or integration type is missing'
        );
        return;
      }

      try {
        const result = await DataStore.decoders.createDecoder({
          document: values,
          integrationId: integrationType,
        });

        if (result) {
          successNotificationToast(
            notifications,
            'create',
            'decoder',
            result.message || `The decoder ${values.name} has been created successfully.`
          );

          history.push(`${ROUTES.DECODERS}`);
        }
      } catch (error: any) {
        errorNotificationToast(
          notifications,
          'create',
          'decoder',
          error?.message || 'An unexpected error occurred while creating the decoder.'
        );
      }
    },
    [integrationType, notifications, history]
  );

  const updateDecoder = useCallback(
    async (values: DecoderDocument) => {
      if (!values) {
        errorNotificationToast(notifications, 'retrieve', 'decoder', 'No decoder to update');
        return;
      }

      try {
        const result = await DataStore.decoders.updateDecoder(idDecoder, {
          document: values,
        });

        if (result) {
          successNotificationToast(
            notifications,
            'update',
            'decoder',
            result.message || `The decoder ${values.name} has been updated successfully.`
          );

          history.push(`${ROUTES.DECODERS}`);
        }
      } catch (error: any) {
        errorNotificationToast(
          notifications,
          'update',
          'decoder',
          error?.message || 'An unexpected error occurred while updating the decoder.'
        );
      }
    },
    [notifications, history]
  );

  const handleOnClick = useCallback(
    async (values: DecoderDocument) => {
      if (action === 'create') {
        await createDecoder(values);
      } else if (action === 'edit') {
        await updateDecoder(values);
      }
    },
    [action, createDecoder, updateDecoder]
  );

  const validateForm = useCallback((values: { rawDecoder: string }) => {
    const errors: FormikErrors<DecoderDocument> = {};

    // FIXME: This is making a transformation on each detected change in the yaml form, this could create a lot of overhead
    const decoder = mapYamlToLosslessDecoder(values.rawDecoder);

    if (!decoder.name) {
      errors.name = 'Decoder name is required';
    }

    const parts = decoder.name.split('/');

    if (parts.length !== 3) {
      errors.name = "Decoder name must have exactly 3 parts 'decoder/<name>/<version>'";
    }

    if (parts?.[0] !== 'decoder') {
      errors.name =
        "Decoder name must start with 'decoder/' and follow the format 'decoder/<name>/<version>'";
    }

    if (parts?.[1]?.trim().length === 0) {
      errors.name =
        "Name cannot have empty parts and must follow the format 'decoder/<name>/<version>'";
    }

    if (parts?.[2]?.trim().length === 0) {
      errors.name =
        "Version cannot have empty parts and must follow the format 'decoder/<name>/<version>'";
    }

    return errors;
  }, []);

  return (
    <>
      {isLoading ? (
        <EuiPanel>
          <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
            <EuiFlexItem grow={false}>
              <EuiLoadingSpinner size="xl" />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      ) : (
        <Formik
          key={decoder?.id || 'new-decoder'}
          initialValues={{ rawDecoder: rawDecoder }}
          validateOnMount={true}
          enableReinitialize={true}
          validate={validateForm}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(false);
            handleOnClick(mapYamlToLosslessDecoder(values.rawDecoder));
          }}
        >
          {(props) => (
            <Form>
              <EuiPanel className={'rule-editor-form'} style={{ paddingBottom: '60px' }}>
                <PageHeader appDescriptionControls={false}>
                  <EuiText size="s">
                    <h1>{actionLabels[action]}</h1>
                  </EuiText>

                  <EuiText size="s" color="subdued">
                    {action === 'create'
                      ? 'Create a new decoder to normalize logs from your selected integration.'
                      : 'Edit the decoder to update the normalization of logs from your selected integration.'}
                  </EuiText>

                  <EuiSpacer size="m" />
                </PageHeader>

                <EuiButtonGroup
                  data-test-subj="change-editor-type"
                  legend="This is editor type selector"
                  options={editorTypes}
                  idSelected={selectedEditorType}
                  onChange={(id) => setSelectedEditorType(id)}
                />

                <EuiSpacer size="m" />

                {action === 'create' && (
                  <>
                    <IntegrationComboBox
                      options={integrationTypeOptions}
                      selectedId={integrationType}
                      isLoading={loadingIntegrations}
                      onChange={onChange}
                      resourceName="decoders"
                      data-test-subj="integration_dropdown"
                      notifications={notifications}
                      onCreateSuccess={onIntegrationCreateSuccess}
                    />
                    <EuiSpacer size="m" />
                  </>
                )}

                {selectedEditorType === 'yaml' && (
                  <YamlForm
                    rawDecoder={props.values.rawDecoder}
                    isInvalid={Object.keys(props.errors).length > 0}
                    errors={Object.keys(props.errors).map(
                      (key) => (props.errors as Record<string, string>)[key]
                    )}
                    change={(e) => {
                      props.setValues({ rawDecoder: e });
                    }}
                    onErrors={(errors) => setHasYamlErrors(errors !== null && errors.length > 0)}
                  />
                )}
              </EuiPanel>

              <EuiBottomBar>
                <EuiFlexGroup
                  gutterSize="s"
                  justifyContent="flexEnd"
                  alignItems="center"
                  responsive={false}
                >
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      color="ghost"
                      size="s"
                      iconType="cross"
                      href={`#${ROUTES.DECODERS}`}
                    >
                      Cancel
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiToolTip
                      content={
                        <>
                          <p>
                            {!integrationType
                              ? 'Select an integration to enable creating the decoder'
                              : ''}
                          </p>
                          <p>
                            {Object.keys(props.errors).length > 0 || hasYamlErrors
                              ? 'Please fix the errors in the form to proceed'
                              : ''}
                          </p>
                        </>
                      }
                      position="top"
                    >
                      <EuiButton
                        color="primary"
                        fill
                        iconType="check"
                        size="s"
                        disabled={
                          !integrationType ||
                          Object.keys(props.errors).length > 0 ||
                          hasYamlErrors
                        }
                        onClick={() => props.handleSubmit()}
                      >
                        {actionLabels[action]} decoder
                      </EuiButton>
                    </EuiToolTip>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiBottomBar>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};
