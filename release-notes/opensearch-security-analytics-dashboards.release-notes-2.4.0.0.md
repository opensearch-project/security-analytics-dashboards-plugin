## Version 2.4.0.0 2022-11-04

Compatible with OpenSearch 2.4.0

### Features
OpenSearch 2.4.0 is the first release with OpenSearch Security Analytics Dashboards.

Security Analytics consist of two plugins, `security-analytics` backend plugin for OpenSearch, and a `securityAnalyticsDashboards` frontend plugin for OpenSearch Dashboards.

The Security Analytics Dashboards plugin lets you manage your Security Analytics plugin to generate critical security insights from their existing security event logs (such as firewall logs, windows logs, authentication audit logs, etc.) directly from OpenSearch Dashboards.
* Added create detectors UI pages. ([#15](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/15))
* Added overview page UI. ([#24](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/24))
* Added configure alerts UI page. ([#25](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/25))

### Infrastructure
* Added basic template files related to OpenSearch guidelines, GitHub workflows for running unit and integration tests, badges to the README, and developer guide and easy setup. ([#2](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/2))

### Maintenance
* Added changes for releasing plugin with OSD as part of 2.4. ([#6](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/6))
