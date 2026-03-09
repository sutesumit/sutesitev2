import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import { deleteBlip } from '../lib/api.js'
import { hasApiKey } from '../lib/config.js'
import { renderErrorBox } from '../lib/ui.js'

export async function deleteCommand(serial: string, options: { force?: boolean }): Promise<void> {
  if (!hasApiKey()) {
    renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
    process.exit(1)
  }

  if (!options.force) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Delete blip ${chalk.cyan(serial)}?`,
        default: false
      }
    ])

    if (!answers.confirm) {
      console.log(chalk.gray('Cancelled'))
      return
    }
  }

  const spinner = ora({ text: 'Deleting blip...', spinner: 'dots' }).start()

  const result = await deleteBlip(serial)

  if (result.error) {
    spinner.fail(chalk.red(result.error))
    process.exit(1)
  }

  spinner.succeed(chalk.green(`Deleted ${serial}`))
}
