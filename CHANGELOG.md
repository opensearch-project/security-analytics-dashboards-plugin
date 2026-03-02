# Change Log

All notable changes to the Wazuh ML Commons project will be documented in this file.

## Wazuh dashboard v5.0.0 - OpenSearch Dashboards 3.3.0 - Revision 00

### Added

- Support for Wazuh 5.0.0
- Added KVDBs management feature with detailed views [#24](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/24) [#30](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/30) [#37](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/37) [#46](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/46) [#82](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/82)
- Added Decoders management feature [#27](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/27) [#30](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/30) [#37](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/37) [#46](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/46) [#41](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/41) [#48](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/48) [#74](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/74)
- Added Integrations management feature [#40](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/40) [#48](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/48) [#62](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/62) [#64](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/64) [#71](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/71) [#72](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/72) [#76](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/76) [#77](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/77) [#81](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/81) [#83](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/83/) [#84](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/84) [#85](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/85) [#86](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/86) [#88](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/88) [#89](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/89)
- Added Log test feature [#43](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/43) [#97](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/97)
- Added space persistence when navigate [#63](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/63)

### Changed

- Renamed Log types to Integrations [#11](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/11)
- Restructured Security Analytics main menu navigation [#11](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/11) [#14](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/14) [#18](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/18) [#36](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/36)
- Hide Alerts/Correlations and Correlation rules from the Security Analytics navigation, leaving Findings at the root level [#8004](https://github.com/wazuh/wazuh-dashboard-plugins/pull/8004)

### Removed

- Removed Threat Intelligence section entirely [#11](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/11) [#20](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/20)

### Fixed

- Fixed YAML Editor when creating or editing detection rules [#9](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/9)
- Fixed detection rule editor causing blank screen [#44](https://github.com/wazuh/wazuh-dashboard-security-analytics/pull/44)
