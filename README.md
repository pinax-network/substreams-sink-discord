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

- [`sf.substreams.entity.v1.EntityChanges`](https://github.com/streamingfast/substreams-entity-change/blob/develop/proto/entity/v1/entity.proto)

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

### Formatting
Supports `JSON` and `YAML` format for configuration file. Example of `config.json` format configuration file:

```json
[
    {
        "entity": "Transfer",
        "channel_ids": [
            "1098279427617603636"
        ],
        "message": "This **{user_id}** made a __transaction__ with id `{trx_id}`"
    },
    {
        "entity": "Grants",
        "channel_ids": [
            "1098279427617603636"
        ],
        "user_ids": [
            "1098268391271313490"
        ],
        "message": "This ||{grant}||"
    }
]
```

Text between `{}` are field names and are used as labels for message templating. In the example above, all `EntityChanges` messages coming from the substream with `entity` key having `Transfer` as value, will be sent to [Discord](https://discord.com/) channel or thread with id `1098279427617603636`, as specified in the first json object.

## Features

### Substreams

- Consume `*.spkg` from:
  - [x] Load URL or IPFS
  - [ ] Read from `*.spkg` local filesystem
  - [ ] Read from `substreams.yaml` local filesystem
- [x] Handle `cursor` restart

### Discord
- [x] Handle rate limit
- [x] Markdown message parsing