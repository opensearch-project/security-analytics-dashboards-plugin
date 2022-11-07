## Version 2.4.0.0 2022-11-07

Compatible with OpenSearch 2.4.0

OpenSearch 2.4.0 is the first release with OpenSearch Security Analytics Dashboards.

Security Analytics consist of two plugins, `security-analytics` backend plugin for OpenSearch, and a `securityAnalyticsDashboards` frontend plugin for OpenSearch Dashboards.

The Security Analytics Dashboards plugin lets you manage critical security findings from your existing security event logs such as sys logs, firewall logs, indows logs, s3 access, Cloud Trail, Netflow, DNS among others directly from OpenSearch Dashboards. It also supports to create alerts on these findings.

### Features
* Added create detectors UI pages. ([#15](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/15)
* Added get mappings API service wrappers. ([#22](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/22))
* Added overview page UI. ([#24](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/24))
* Added configure alerts UI page. ([#25](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/25))
* Added rules UI pages. ([#55](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/55))
* Added toast notifications. ([#70](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/70))

### Infrastructure
* Added basic template files related to OpenSearch guidelines, GitHub workflows for running unit and integration tests, badges to the README, and developer guide and easy setup. ([#2](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/2))

### Maintenance
* Added changes for releasing plugin with OSD as part of 2.4. ([#6](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/6))
