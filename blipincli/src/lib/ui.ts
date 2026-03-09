import chalk from 'chalk'
import boxen from 'boxen'
import Table from 'cli-table3'
import type { Blip } from './api.js'

export const ASCII_LOGO = `
${chalk.yellow('██████╗ ')}${chalk.yellow('██╗     ')}${chalk.red('██╗')}${chalk.red('██████╗ ')}
${chalk.yellow('██╔══██╗')}${chalk.yellowBright('██║     ')}${chalk.red('██║')}${chalk.redBright('██╔══██╗')}
${chalk.yellowBright('██████╔╝')}${chalk.yellowBright('██║     ')}${chalk.redBright('██║')}${chalk.redBright('██████╔╝')}
${chalk.whiteBright('██╔══██╗')}${chalk.yellowBright('██║     ')}${chalk.redBright('██║')}${chalk.red('██╔═══╝ ')}
${chalk.whiteBright('╚█████╔╝')}${chalk.white('███████╗')}${chalk.red('██║')}${chalk.red('██║     ')}
${chalk.gray(' ╚════╝ ')}${chalk.gray('╚══════╝')}${chalk.red('╚═╝')}${chalk.red('╚═╝     ')}
`

export function showBanner(): void {
  console.log(ASCII_LOGO)
  console.log(chalk.gray('  for sumitsute.com/blip'))
  console.log()
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return chalk.green('now')
  if (diffMins < 60) return chalk.gray(`${diffMins}m`)
  if (diffHours < 24) return chalk.gray(`${diffHours}h`)
  if (diffDays < 7) return chalk.gray(`${diffDays}d`)
  return chalk.gray(date.toLocaleDateString())
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function renderBlipBox(blip: Blip): void {
  const content = boxen(
    `${chalk.cyan.bold(blip.blip_serial)} ${chalk.gray('│')} ${chalk.white(blip.content)}\n\n${chalk.gray('Created: ')}${formatFullDate(blip.created_at)}`,
    {
      padding: 1,
      margin: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'cyan',
      title: chalk.bold('blip'),
      titleAlignment: 'center'
    }
  )
  console.log()
  console.log(content)
  console.log()
}

export function renderBlipsTable(blips: Blip[]): void {
  if (blips.length === 0) {
    console.log()
    console.log(chalk.gray('  No blips yet. Create one with:'))
    console.log(chalk.gray('  ') + chalk.cyan('blip "your thought here"'))
    console.log()
    return
  }

  const table = new Table({
    head: [chalk.gray('serial'), chalk.gray('content'), chalk.gray('ago')],
    colWidths: [8, 50, 8],
    style: {
      head: [],
      border: ['gray'],
      compact: true
    },
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│'
    }
  })

  for (const blip of blips) {
    table.push([
      chalk.cyan.bold(blip.blip_serial),
      blip.content.length > 47 ? blip.content.substring(0, 44) + '...' : blip.content,
      formatTimeAgo(blip.created_at)
    ])
  }

  console.log()
  console.log(chalk.bold(`  Blips (${blips.length})`))
  console.log()
  console.log(table.toString())
  console.log()
}

export function renderSuccessBox(message: string, subtitle?: string): void {
  const content = subtitle 
    ? `${chalk.green('✔')} ${message}\n${chalk.gray(subtitle)}`
    : `${chalk.green('✔')} ${message}`
  
  console.log()
  console.log(boxen(content, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 0, left: 2, right: 2 },
    borderStyle: 'round',
    borderColor: 'green'
  }))
  console.log()
}

export function renderErrorBox(message: string, hint?: string): void {
  const content = hint
    ? `${chalk.red('✖')} ${message}\n${chalk.gray(hint)}`
    : `${chalk.red('✖')} ${message}`
  
  console.log()
  console.log(boxen(content, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 0, left: 2, right: 2 },
    borderStyle: 'round',
    borderColor: 'red'
  }))
  console.log()
}

export function renderConfigBox(config: { url: string; key: string }): void {
  const content = `${chalk.bold('API URL:')} ${config.url}\n${chalk.bold('API Key:')} ${config.key ? chalk.green('****configured') : chalk.red('not set')}`
  
  console.log()
  console.log(boxen(content, {
    padding: 1,
    margin: { top: 0, bottom: 0, left: 2, right: 2 },
    borderStyle: 'round',
    borderColor: 'yellow',
    title: chalk.bold('configuration'),
    titleAlignment: 'center'
  }))
  console.log()
}
