# Draw 4 Me (Auto Draw)

The below script uses a simplified syntax to draw simple charts and
arrows with emojis and icons. The goal would be for the emojis and/or icons
to be supplied by third-party components such as the noun project. Other ideas
include the concept to use ChatGPT to take a story and create a summary picture.

## Syntax

The syntax is similar to [ZenUML](https://mermaid.js.org/syntax/zenuml.html) which is used in Mermaid syntax. The example syntax below, will produce a chart similar to below.

```draw4me
A -> B: Slow.
A -> C, D: Fast.
E -> D: Great
D -> G: Hello
G -> W: Yes 
```

![Example Diagram](./docs/imgs/example.png)