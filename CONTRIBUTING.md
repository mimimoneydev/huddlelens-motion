# Contributing

Issues and pull requests are welcome. Keep the package dependency-free where practical and preserve its privacy properties.

Before submitting a change:

```bash
npm test
npm pack --dry-run
```

Changes touching camera input must document their data flow and must not add persistence, recording, network transmission, identity inference, or analytics. Include tests for input validation and a camera-free path.

By contributing, you agree that your contribution is licensed under the MIT License.
