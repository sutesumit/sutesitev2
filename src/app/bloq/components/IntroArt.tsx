'use client'
import React, { useState } from "react";

const IntroArt = () => {
  const [answer] = useState(`[ don't repeat yourself ]`)
  const art = String.raw`
.---------------------------------------------------------------------.
| [Esc] [F1][F2][F3][F4][F5][F6][F7][F8][F9][F0][F10][F11][F12] o o o |
|                                                                     |
| [\`][1][2][3][4][5][6][7][8][9][0][-][=][ <]  [I][H][U] [N][/][*][-]|
| [|-][Q][W][E][R][T][Y][U][I][O][P][{][}] [ ]  [D][E][D] [7][8][9][+]|
| [CAP][A][S][D][F][G][H][J][K][L][;]['][#][_]            [4][5][6][_]|
| [^][\\][Z][X][C][V][B][N][M][,][.][/][  ^  ]     [^]    [1][2][3][ ]|
| [c]   [a][________________________][a]   [c]  [<][V][>] [ 0  ][.][_]|
'---------------------------------------------------------------------'
`;


const formattedKeys = art.replace(/\[.*?\]/g, (match) => {

  const onClickAttr = `onclick="this.classList.add('scale-0', 'opacity-0', 'rotate-45', 'translate-y-5')"`
  const formattedKeysAttr = `class="key inline-block cursor-pointer hover:scale-90 transition-all duration-1000 ease-out"`
  const hoverAttr = `onmouseenter="this.style.color='rgb('+Math.floor(Math.random()*256)+','+Math.floor(Math.random()*256)+','+Math.floor(Math.random()*256)+')'" onmouseleave="this.style.color=''"`;



  return `<div ${formattedKeysAttr} ${hoverAttr} ${onClickAttr}>${match}</div>`
})

  return (
    <div className="m-auto flex flex-col justify-center items-center overflow-x-hidden">
      <pre
        className="ascii-art text-sm leading-tight whitespace-pre rota"
        dangerouslySetInnerHTML={{ __html: formattedKeys }}
      ></pre>
      <div className="mt-4">{answer}</div>
    </div>
  );
};

export default IntroArt;
