import chalk from 'chalk'
import ora from 'ora'
import { createBlip } from '../lib/api.js'
import { hasApiKey } from '../lib/config.js'
import { renderSuccessBox, renderErrorBox, formatTimeAgo } from '../lib/ui.js'

export async function newCommand(content: string): Promise<void> {
  if (!hasApiKey()) {
    renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
    process.exit(1)
  }

  if (!content || content.trim().length === 0) {
    renderErrorBox('Content is required')
    process.exit(1)
  }

  if (content.length > 280) {
    renderErrorBox('Content must be 280 characters or less')
    process.exit(1)
  }

  const spinner = ora({ text: 'Creating blip...', spinner: 'dots' }).start()

  const result = await createBlip(content.trim())

  if (result.error) {
    spinner.fail(chalk.red(result.error))
    process.exit(1)
  }

  spinner.succeed(chalk.green(`Created ${result.data!.blip.blip_serial}`))
  
  const blip = result.data!.blip
  
  console.log()
  console.log(chalk.gray('   ') + chalk.cyan.bold(blip.blip_serial) + chalk.gray(' │ ') + chalk.white(blip.content) + chalk.gray(' │ ') + formatTimeAgo(blip.created_at))
}
