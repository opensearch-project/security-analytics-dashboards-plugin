/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
*/

import React from "react";
import { EuiLink } from "@elastic/eui";
import moment from "moment";
import { DEFAULT_EMPTY_DATA } from "../../../utils/constants";

type MetadataFieldType =
  | "text"
  | "number"
  | "date"
  | "url"
  | "boolean"
  | "boolean_yesno";

export const MetadataFieldText: React.FC<{ value: string | number }> = ({
  value,
}) => {
  return <>{value}</>;
};

export const MetadataFieldURL: React.FC<{ value: string | number }> = ({
  value,
}) => {
  const url = String(value);
  return (
    <EuiLink target="_blank" rel="noopener noreferrer" href={url}>
      {url}
    </EuiLink>
  );
};

export const MetadataFieldBoolean: React.FC<{ value: string | number }> = ({
  value,
}) => {
  return <>{String(value)}</>;
};

export const MetadataFieldBooleanAsYesNo: React.FC<{
  value: string | number;
}> = ({ value }) => {
  return <>{value ? "Yes" : "No"}</>;
};

export const MetadataFieldDate: React.FC<{ value: string | number }> = ({
  value,
}) => {
  if (!value) {
    return <>{DEFAULT_EMPTY_DATA}</>;
  }
  // FIXME: This should use the format specified in the settings
  // Format date similar to formatUIDate: "MMM DD, YYYY @ HH:mm:ss.SSS"
  try {
    const date = moment(value);
    if (date.isValid()) {
      return <>{date.format("MMM DD, YYYY @ HH:mm:ss.SSS")}</>;
    }
    return <>{String(value)}</>;
  } catch {
    return <>{String(value)}</>;
  }
};

const mapFieldRenderers: {
  [key in MetadataFieldType]: React.FC<{ value: any }>;
} = {
  text: MetadataFieldText,
  boolean: MetadataFieldBoolean,
  boolean_yesno: MetadataFieldBooleanAsYesNo,
  number: MetadataFieldText,
  date: MetadataFieldDate,
  url: MetadataFieldURL,
};

export const Metadata: React.FC<{
  type?: MetadataFieldType;
  value: string | number;
  label?: string;
}> = ({ value, label, type = "text" }) => {
  return (
    <div>
      <div>
        <strong>{label}</strong>
      </div>
      <div style={label ? { marginTop: "4px" } : {}}>
        {typeof value === "undefined" || value === ""
          ? DEFAULT_EMPTY_DATA
          : Array.isArray(value)
            ? value.map((v, i) => (
                <div key={`${label}-${i}`}>
                  {mapFieldRenderers[type]({ value: v })}
                </div>
              ))
            : mapFieldRenderers[type]({ value })}
      </div>
    </div>
  );
};
