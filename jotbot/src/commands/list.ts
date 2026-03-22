import chalk from 'chalk'
import ora from 'ora'
import { listBlips } from '../lib/api.js'
import { renderBlipsTable } from '../lib/ui.js'

export async function listCommand(options: { json?: boolean }): Promise<void> {
  const spinner = options.json ? null : ora({ text: 'Fetching blips...', spinner: 'dots' }).start()

  const result = await listBlips()

  if (result.error) {
    spinner?.fail(chalk.red(result.error))
    process.exit(1)
  }

  spinner?.stop()

  const blips = result.data!.blips

  if (options.json) {
    console.log(JSON.stringify(blips, null, 2))
    return
  }

  renderBlipsTable(blips)
}
