Pillr
=====

Pillr is a framework to build static site generators upon.

The framework is designed to only contain the core components and architecture of a static site generator. It is up to the user to extend Pillr with the desired features to build a fully-fledged static site generator.


## Features

- CommonMark (Markdown) syntax to generate HTML content.
- JSON front matter to define metadata for each page.
- Mustache to define layout templates.
- support for styling using LESS.
- support for Markdown extensions: abbreviations, containers, definition lists, footnotes, subscript, and superscript.
- no database, everything is contained in the metadata and the final file hiearchy mirrors the one used as the source.
- propagation of metadata to descendant files if specified at the directory level.
- theme-based.
- async.


Pillr ships with 3 base compounds to copy asset files, and to generate pages or styles.

A compound defines a serie of components that transforms the source files into the final result to be written at a given destination. They are extensible and customizable.


## Installation

```shell
$ npm install pillr
```


## Out There

Projects using Pillr include:

- [eddi](https://github.com/christophercrouzet/eddi)


## Author

Christopher Crouzet
[<christophercrouzet.com>](https://christophercrouzet.com)
