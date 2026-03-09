import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import { updateBlip } from '../lib/api.js'
import { hasApiKey } from '../lib/config.js'
import { renderErrorBox } from '../lib/ui.js'

export async function editCommand(serial: string, content?: string): Promise<void> {
  if (!hasApiKey()) {
    renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
    process.exit(1)
  }

  let finalContent: string = content || ''

  if (!finalContent.trim()) {
    const answers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'content',
        message: 'Edit blip:',
        validate: (input: string) => {
          if (!input.trim()) return 'Content is required'
          if (input.length > 280) return 'Content must be 280 characters or less'
          return true
        }
      }
    ])
    finalContent = answers.content
  }

  if (finalContent.length > 280) {
    renderErrorBox('Content must be 280 characters or less')
    process.exit(1)
  }

  const spinner = ora({ text: 'Updating blip...', spinner: 'dots' }).start()

  const result = await updateBlip(serial, finalContent.trim())

  if (result.error) {
    spinner.fail(chalk.red(result.error))
    process.exit(1)
  }

  spinner.succeed(chalk.green(`Updated ${serial}`))
  
  const blip = result.data!.blip
  console.log()
  console.log(chalk.gray('   ') + chalk.cyan.bold(blip.blip_serial) + chalk.gray(' │ ') + chalk.white(blip.content))
}
