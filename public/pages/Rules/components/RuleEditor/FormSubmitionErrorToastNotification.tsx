/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../../../../utils/helpers';

export const FormSubmitionErrorToastNotification = ({
  notifications,
}: {
  notifications?: NotificationsStart;
}) => {
  const { submitCount, isValid } = useFormikContext();
  const [prevSubmitCount, setPrevSubmitCount] = useState(submitCount);

  useEffect(() => {
    if (isValid) return;

    if (submitCount === prevSubmitCount) return;

    setPrevSubmitCount(submitCount);

    errorNotificationToast(
      notifications!,
      'create',
      'rule',
      'Some fields are invalid. Fix all highlighted error(s) before continuing.'
    );
  }, [submitCount, isValid]);
  return null;
};
