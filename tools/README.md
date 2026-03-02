# Versioning tools

## repository_bumper.sh

This script automates the process of updating the version and stage in the Wazuh Security Analytics Dashboard plugin repository, using only shell commands.

### Usage

```bash
./repository_bumper.sh --version VERSION --stage STAGE [--tag] [--help]
```

#### Parameters

- `--version VERSION`
  Specifies the new version (e.g., `4.6.0`).
  Required if `--tag` is not used.

- `--stage STAGE`
  Specifies the stage (e.g., `alpha0`, `beta1`, `rc2`, etc.).
  Required if `--tag` is not used.

- `--tag`
  Generate a tag version format.

- `--help`
  Shows help and exits.

#### Examples

```bash
./repository_bumper.sh --version 4.6.0 --stage alpha0
./repository_bumper.sh --version 4.6.0 --stage beta1
./repository_bumper.sh --tag --stage alpha1
./repository_bumper.sh --tag
```

### What does the script do?

1. **Validates input parameters** and shows error messages if they are incorrect.
2. **Reads the current version and stage** from `VERSION.json` and the revision from `package.json`.
3. **Compares the new version with the current one**:
   - If the version changes (major, minor, or patch), it resets the revision to `00`.
   - If the version is the same, it increments the revision.
4. **Updates the files**:
   - `VERSION.json`: Changes the `version` and `stage` fields.
   - `package.json`: Changes the `version` and `revision` fields inside the `wazuh` object.
   - `.github/workflows/5_builderpackage_security_analytics_plugin.yml`: Updates the default value of the `reference` input.
   - `docker/imposter/wazuh-config.yml`: Updates the specFile URL with the new version.
   - `docker/imposter/api-info/api_info.json`: Updates the API version information.
5. **Logs all actions** to a log file in the `tools` directory.

### Notes

- The script must be run from anywhere inside the git repository.
- You need write permissions for the files to be modified.
- The script uses `sed` to modify files, so the file format must be consistent.

### Affected files

- `CHANGELOG.md`
- `VERSION.json`
- `package.json`

### Log

Each execution generates a log file in the `tools` directory with details of the operation.

