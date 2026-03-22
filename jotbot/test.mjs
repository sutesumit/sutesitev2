// <stdin>
import { Command } from "commander";
var p = new Command();
p.argument("[args...]").action((args, opts) => console.log("args:", args, "opts:", opts));
p.parse(process.argv);
