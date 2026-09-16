## Version 3.9.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.9.0

### Features

* Integrate centralized resource-sharing share button for detectors and correlation rules ([#1564](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1564))

### Bug Fixes

* Fix query-string import crash and Access column overflow on OpenSearch Dashboards 3.9 ([#1575](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1575))
* Fix CVE-2026-44705 by pinning tmp dependency to ^0.2.7 ([#1561](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1561))

### Infrastructure

* Fix code-coverage GitHub Action ([#1574](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1574))

### Maintenance

* Clean up dependency resolutions and align versions with OpenSearch Dashboards 3.8, addressing multiple CVEs ([#1559](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1559))
