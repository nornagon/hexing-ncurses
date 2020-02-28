# hexing-ncurses
This is the custom presentation software I used to give my WaffleJS talk in June 2019 about terminals and how ncurses works.

To run this, in its somewhat hacky state you'll also need https://github.com/nornagon/terminfo.js

```sh
$ git clone https://github.com/nornagon/terminfo.js
$ cd terminfo.js
$ npm link
$ cd ..
$ git clone https://github.com/nornagon/hexing-ncurses
$ cd hexing-ncurses
$ npm link terminfo
$ node .
```

Many of the slides were created with [Charaster][], by [@Technicism][].

[Charaster]: https://technicism.github.io/Charaster/
[Technicism]: https://github.com/Technicism
