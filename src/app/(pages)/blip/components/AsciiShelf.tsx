export default function AsciiShelf() {
  return (
    <div className="w-full overflow-x-auto">
      <pre
        className="mx-auto w-fit font-mono text-[14px] leading-[1] text-blue-500"
        aria-hidden="true"
      >
        {`      .--.                   .---.
   .---|__|           .-.     |~~~|
.--|===|--|_          |_|     |~~~|--.
|  |===|  |'\     .---!~|  .--|   |--|
|%%|   |  |.'\    |===| |--|%%|   |  |
|%%|   |  |\.'\   |   | |__|  |   |  |
|  |   |  | \  \  |===| |==|  |   |  |
|  |   |__|  \.'\ |   |_|__|  |~~~|__|
|  |===|--|   \.'\|===|~|--|%%|~~~|--|
^--^---'--^    \`-'\`---^-^--^--^---'--'
`}
      </pre>
    </div>
  );
}