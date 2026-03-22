import chalk from 'chalk'
import boxen from 'boxen'

const palette = ['#ff0055', '#ff7a00', '#ffd500', '#00d4ff', '#7b5cff'];

export const ASCII_LOGO = `
${chalk.hex('#ff0055')('     ██╗ ')}${chalk.hex('#ff0055')('██████╗ ')}${chalk.hex('#ffd500')('████████╗')}${chalk.hex('#00d4ff')('██████╗  ')}${chalk.hex('#00d4ff')('██████╗ ')}${chalk.hex('#ff0055')('████████╗')}
${chalk.hex('#ff0055')('     ██║')}${chalk.hex('#ffd500')('██╔═══██╗')}${chalk.hex('#ffd500')('╚══██╔══╝')}${chalk.hex('#00d4ff')('██╔══██╗')}${chalk.hex('#00d4ff')('██╔═══██╗')}${chalk.hex('#ff0055')('╚══██╔══╝')}
${chalk.hex('#ffd500')('     ██║')}${chalk.hex('#ffd500')('██║   ██║')}${chalk.hex('#00d4ff')('   ██║   ') }${chalk.hex('#00d4ff')('██████╔╝')}${chalk.hex('#ff0055')('██║   ██║')}${chalk.hex('#ff0055')('   ██║   ')}
${chalk.hex('#ffd500')('██   ██║')}${chalk.hex('#00d4ff')('██║   ██║')}${chalk.hex('#00d4ff')('   ██║   ') }${chalk.hex('#ff0055')('██╔══██╗')}${chalk.hex('#ff0055')('██║   ██║')}${chalk.hex('#ffd500')('   ██║   ')}
${chalk.hex('#00d4ff')('╚█████╔╝')}${chalk.hex('#00d4ff')('╚██████╔╝')}${chalk.hex('#ff0055')('   ██║   ') }${chalk.hex('#ff0055')('██████╔╝')}${chalk.hex('#ffd500')('╚██████╔╝')}${chalk.hex('#ffd500')('   ██║   ')}
${chalk.hex('#00d4ff')(' ╚════╝  ') }${chalk.hex('#ff0055')('╚═════╝ ') }${chalk.hex('#ff0055')('   ╚═╝   ') }${chalk.hex('#ffd500')('╚═════╝ ') }${chalk.hex('#ffd500')(' ╚═════╝ ') }${chalk.hex('#00d4ff')('   ╚═╝   ')}
`;

export function showBanner(): void {
  console.log(ASCII_LOGO)
  console.log(chalk.gray('  for bytes & blips on sumitsute.com'))
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
