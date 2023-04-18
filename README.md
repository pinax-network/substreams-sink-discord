# [`Substreams`](https://substreams.streamingfast.io/) [Discord](https://discord.com/) CLI `Node.js`

<!-- [<img alt="github" src="" height="20">](https://github.com/pinax-network/substreams-sink-discord) -->
<!-- [<img alt="npm" src="" height="20">](https://www.npmjs.com/package/substreams-sink-discord) -->
<!-- [<img alt="GitHub Workflow Status" src="" height="20">](https://github.com/pinax-network/substreams-sink-discord/actions?query=branch%3Amain) -->

> `substreams-sink-discord` is a tool that allows developers to pipe data extracted from a blockchain to the Discord messaging social platform.

## 📖 Documentation

<!-- ### https://www.npmjs.com/package/substreams-sink-discord -->

### Further resources

- [**Substreams** documentation](https://substreams.streamingfast.io)
- [**Discord** API documentation](https://discord.com/developers/docs/intro)

### Protobuf

## CLI
[**Use pre-built binaries**](https://github.com/pinax-network/substreams-sink-discord/releases)
- [x] MacOS
- [x] Linux
- [x] Windows

**Install** globally via npm
```
$ npm install -g substreams-sink-discord
```

**Run**
```
$ substreams-sink-discord run [options] <spkg>
```

## Features

- Consume `*.spkg` from:
  - [x] Load URL or IPFS
  - [ ] Read from `*.spkg` local filesystem
  - [ ] Read from `substreams.yaml` local filesystem
- [x] Handle `cursor` restart