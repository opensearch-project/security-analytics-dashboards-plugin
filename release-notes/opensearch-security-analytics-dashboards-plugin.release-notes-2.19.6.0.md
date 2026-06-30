## Version 2.19.6 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 2.19.6

### Bug Fixes

* Fix webpack build failure on Node 18 by removing uuid resolution that used incompatible optional chaining syntax ([#1543](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1543))

### Maintenance

* Resolve CVE-2026-33750 by bumping brace-expansion to ^5.0.5 to prevent infinite loop on zero-step brace patterns ([#1421](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1421))
* Resolve CVE-2026-4800, CVE-2026-27904, CVE-2026-33532, and CVE-2026-33672 by bumping lodash and lodash-es to ^4.18.0 ([#1514](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1514))
* Resolve CVE-2026-8723 by bumping qs to ^6.15.2 to fix TypeError with arrayFormat comma and null array entries ([#1532](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1532))
* Resolve CVE-2026-2739, CVE-2025-69873, and GHSA-5c6j-r48x-rmvq ([#1538](https://github.com/opensearch-project/security-analytics-dashboards-plugin/pull/1538))
