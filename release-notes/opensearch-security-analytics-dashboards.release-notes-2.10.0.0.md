## Version 2.10.0.0 2023-09-06

Compatible with OpenSearch Dashboards 2.10.0

### Maintenance
* Bumped tough-cookie, and semver versions. ([#658](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/656))
* Update version of word-wrap ([#695](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/695))
* bump @cypress/request to 3.0.0 due to CVE-2023-28155. ([#702](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/702))

## Bug Fixes
* Pass sortOrder and size params when getting findings and alerts. ([#665](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/665))
* Added check for empty action. ([#709](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/709))


### Features
* Added new log type for vpc flow. ([#653](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/653))
* [Custom log types] Show log types table, Log type creation workflow ([#674](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/674))
* [Custom log types] CRUD operations for log types. ([#675](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/675))
* [Custom log types] Support custom log types in detection rule creation and detector creation. ([#676](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/676))
* Make tags hyperlinks to mitre attack web pages in detection rules. ([#692](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/692))
* Added CIDR modifier for detection fields. ([#693](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/693))

### Refactoring
* UI polish for correlations and custom log types. ([#683](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/683))
* [Correlations] Update node size and cursor in correlations graph ([#687](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/687))
* Updates to log types related UX. ([#694](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/694))
* Minor UI updates for correlations page ([#712](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/712))

