import chalk from 'chalk'
import ora from 'ora'
import { getBlip } from '../lib/api.js'
import { renderBlipBox } from '../lib/ui.js'

export async function getCommand(serial: string, options: { json?: boolean }): Promise<void> {
  const spinner = options.json ? null : ora({ text: 'Fetching blip...', spinner: 'dots' }).start()

  const result = await getBlip(serial)

  if (result.error) {
    spinner?.fail(chalk.red(result.error))
    process.exit(1)
  }

  spinner?.stop()

  const blip = result.data!.blip

  if (options.json) {
    console.log(JSON.stringify(blip, null, 2))
    return
  }

  renderBlipBox(blip)
}
