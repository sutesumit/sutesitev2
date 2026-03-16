#!/usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import {
  createByte, listBytes, getByte, updateByte, deleteByte,
  createBlipGlossary, listBlipsGlossary, getBlipGlossary, updateBlipGlossary, deleteBlipGlossary,
  type Byte, type Blip
} from './lib/api.js'
import { getConfig, setConfig, hasApiKey } from './lib/config.js'
import { showBanner, renderConfigBox, renderSuccessBox, renderErrorBox, formatTimeAgo, formatFullDate } from './lib/ui.js'
import boxen from 'boxen'
import Table from 'cli-table3'

const SERIAL_PATTERN = /^[a-zA-Z0-9]{1,6}$/

const showHelp = process.argv.includes('--help') || process.argv.includes('-h')
const showVersion = process.argv.includes('--version') || process.argv.includes('-V')
const noArgs = process.argv.length <= 2

if (showHelp || showVersion || noArgs) {
  showBanner()
}

const program = new Command()

program
  .name('blip')
  .description('CLI for managing bytes (short thoughts) and blips (term:meaning definitions)')
  .version('1.0.0')

program
  .command('byte add <content...>')
  .description('Create a new byte (short thought)')
  .action(async (contentParts: string[]) => {
    if (!hasApiKey()) {
      renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
      process.exit(1)
    }
    const content = contentParts.join(' ')
    if (!content.trim()) {
      renderErrorBox('Content is required')
      process.exit(1)
    }
    if (content.length > 280) {
      renderErrorBox('Content must be 280 characters or less')
      process.exit(1)
    }
    const spinner = (await import('ora')).default({ text: 'Creating byte...', spinner: 'dots' }).start()
    const result = await createByte(content.trim())
    if (result.error) {
      spinner.fail(chalk.red(result.error))
      process.exit(1)
    }
    spinner.succeed(chalk.green(`Created ${result.data!.byte.byte_serial}`))
    const byte = result.data!.byte
    console.log()
    console.log(chalk.gray('   ') + chalk.cyan.bold(byte.byte_serial) + chalk.gray(' │ ') + chalk.white(byte.content) + chalk.gray(' │ ') + formatTimeAgo(byte.created_at))
  })

program
  .command('blip add <termMeaning>')
  .description('Create a new blip (term:meaning pair). Format: "term:meaning"')
  .action(async (termMeaning: string) => {
    if (!hasApiKey()) {
      renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
      process.exit(1)
    }
    const colonIndex = termMeaning.indexOf(':')
    if (colonIndex === -1) {
      renderErrorBox('Invalid format', 'Use "term:meaning" format')
      process.exit(1)
    }
    const term = termMeaning.substring(0, colonIndex).trim()
    const meaning = termMeaning.substring(colonIndex + 1).trim()
    if (!term || !meaning) {
      renderErrorBox('Both term and meaning are required')
      process.exit(1)
    }
    const spinner = (await import('ora')).default({ text: 'Creating blip...', spinner: 'dots' }).start()
    const result = await createBlipGlossary(term, meaning)
    if (result.error) {
      spinner.fail(chalk.red(result.error))
      process.exit(1)
    }
    spinner.succeed(chalk.green(`Created ${result.data!.blip.blip_serial}`))
    const blip = result.data!.blip
    console.log()
    console.log(chalk.gray('   ') + chalk.cyan.bold(blip.blip_serial) + chalk.gray(' │ ') + chalk.yellow(blip.term) + chalk.gray(':') + chalk.white(blip.meaning) + chalk.gray(' │ ') + formatTimeAgo(blip.created_at))
  })

program
  .command('ls')
  .description('List bytes or blips (default: bytes)')
  .option('-t, --type <type>', 'Type to list: byte or blip', 'byte')
  .option('--json', 'Output as JSON')
  .action(async (options: { type?: string; json?: boolean }) => {
    const type = options.type || 'byte'
    if (type === 'blip') {
      const spinner = options.json ? null : (await import('ora')).default({ text: 'Fetching blips...', spinner: 'dots' }).start()
      const result = await listBlipsGlossary()
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
      renderBlipsGlossaryTable(blips)
    } else {
      const spinner = options.json ? null : (await import('ora')).default({ text: 'Fetching bytes...', spinner: 'dots' }).start()
      const result = await listBytes()
      if (result.error) {
        spinner?.fail(chalk.red(result.error))
        process.exit(1)
      }
      spinner?.stop()
      const bytes = result.data!.bytes
      if (options.json) {
        console.log(JSON.stringify(bytes, null, 2))
        return
      }
      renderBytesTable(bytes)
    }
  })

program
  .command('get')
  .description('Get a specific byte or blip')
  .argument('<type>', 'Type: byte or blip')
  .argument('<serial>', 'Serial code')
  .option('--json', 'Output as JSON')
  .action(async (type: string, serial: string, options: { json?: boolean }) => {
    if (type === 'blip') {
      const spinner = options.json ? null : (await import('ora')).default({ text: 'Fetching blip...', spinner: 'dots' }).start()
      const result = await getBlipGlossary(serial)
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
      renderBlipGlossaryBox(blip)
    } else {
      const spinner = options.json ? null : (await import('ora')).default({ text: 'Fetching byte...', spinner: 'dots' }).start()
      const result = await getByte(serial)
      if (result.error) {
        spinner?.fail(chalk.red(result.error))
        process.exit(1)
      }
      spinner?.stop()
      const byte = result.data!.byte
      if (options.json) {
        console.log(JSON.stringify(byte, null, 2))
        return
      }
      renderByteBox(byte)
    }
  })

program
  .command('edit')
  .description('Edit a byte or blip')
  .argument('<type>', 'Type: byte or blip')
  .argument('<serial>', 'Serial code')
  .argument('<content...>', 'New content')
  .action(async (type: string, serial: string, contentParts: string[]) => {
    if (!hasApiKey()) {
      renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
      process.exit(1)
    }
    const content = contentParts.join(' ')
    if (type === 'blip') {
      const colonIndex = content.indexOf(':')
      if (colonIndex === -1) {
        renderErrorBox('Invalid format', 'Use "term:meaning" format')
        process.exit(1)
      }
      const term = content.substring(0, colonIndex).trim()
      const meaning = content.substring(colonIndex + 1).trim()
      if (!term || !meaning) {
        renderErrorBox('Both term and meaning are required')
        process.exit(1)
      }
      const spinner = (await import('ora')).default({ text: 'Updating blip...', spinner: 'dots' }).start()
      const result = await updateBlipGlossary(serial, term, meaning)
      if (result.error) {
        spinner.fail(chalk.red(result.error))
        process.exit(1)
      }
      spinner.succeed(chalk.green(`Updated ${serial}`))
      const blip = result.data!.blip
      console.log()
      console.log(chalk.gray('   ') + chalk.cyan.bold(blip.blip_serial) + chalk.gray(' │ ') + chalk.yellow(blip.term) + chalk.gray(':') + chalk.white(blip.meaning))
    } else {
      if (content.length > 280) {
        renderErrorBox('Content must be 280 characters or less')
        process.exit(1)
      }
      const spinner = (await import('ora')).default({ text: 'Updating byte...', spinner: 'dots' }).start()
      const result = await updateByte(serial, content.trim())
      if (result.error) {
        spinner.fail(chalk.red(result.error))
        process.exit(1)
      }
      spinner.succeed(chalk.green(`Updated ${serial}`))
      const byte = result.data!.byte
      console.log()
      console.log(chalk.gray('   ') + chalk.cyan.bold(byte.byte_serial) + chalk.gray(' │ ') + chalk.white(byte.content))
    }
  })

program
  .command('rm')
  .description('Delete a byte or blip')
  .argument('<type>', 'Type: byte or blip')
  .argument('<serial>', 'Serial code')
  .option('-f, --force', 'Skip confirmation')
  .action(async (type: string, serial: string, options: { force?: boolean }) => {
    if (!hasApiKey()) {
      renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
      process.exit(1)
    }
    if (!options.force) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Delete ${type} ${chalk.cyan(serial)}?`,
          default: false
        }
      ])
      if (!answers.confirm) {
        console.log(chalk.gray('Cancelled'))
        return
      }
    }
    const spinner = (await import('ora')).default({ text: 'Deleting...', spinner: 'dots' }).start()
    const result = type === 'blip' 
      ? await deleteBlipGlossary(serial)
      : await deleteByte(serial)
    if (result.error) {
      spinner.fail(chalk.red(result.error))
      process.exit(1)
    }
    spinner.succeed(chalk.green(`Deleted ${serial}`))
  })

program
  .command('interactive')
  .description('Interactive mode')
  .alias('i')
  .action(async () => {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Create a new byte', value: 'create-byte' },
          { name: 'Create a new blip', value: 'create-blip' },
          { name: 'View all bytes', value: 'list-byte' },
          { name: 'View all blips', value: 'list-blip' },
          { name: 'View a specific byte', value: 'get-byte' },
          { name: 'View a specific blip', value: 'get-blip' },
          { name: 'Edit a byte', value: 'edit-byte' },
          { name: 'Edit a blip', value: 'edit-blip' },
          { name: 'Delete a byte', value: 'delete-byte' },
          { name: 'Delete a blip', value: 'delete-blip' },
          { name: 'Configure settings', value: 'config' },
          new inquirer.Separator(),
          { name: 'Exit', value: 'exit' }
        ]
      }
    ])

    switch (action) {
      case 'create-byte': {
        if (!hasApiKey()) {
          renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
          process.exit(1)
        }
        const { content } = await inquirer.prompt([
          {
            type: 'input',
            name: 'content',
            message: 'Byte content:',
            validate: (input: string) => {
              if (!input.trim()) return 'Content is required'
              if (input.length > 280) return 'Content must be 280 characters or less'
              return true
            }
          }
        ])
        const spinner = (await import('ora')).default({ text: 'Creating byte...', spinner: 'dots' }).start()
        const result = await createByte(content.trim())
        if (result.error) {
          spinner.fail(chalk.red(result.error))
          process.exit(1)
        }
        spinner.succeed(chalk.green(`Created ${result.data!.byte.byte_serial}`))
        break
      }
      case 'create-blip': {
        if (!hasApiKey()) {
          renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
          process.exit(1)
        }
        const { termMeaning } = await inquirer.prompt([
          {
            type: 'input',
            name: 'termMeaning',
            message: 'Blip (term:meaning):',
            validate: (input: string) => {
              if (!input.includes(':')) return 'Use "term:meaning" format'
              const colonIndex = input.indexOf(':')
              if (!input.substring(0, colonIndex).trim()) return 'Term is required'
              if (!input.substring(colonIndex + 1).trim()) return 'Meaning is required'
              return true
            }
          }
        ])
        const colonIndex = termMeaning.indexOf(':')
        const term = termMeaning.substring(0, colonIndex).trim()
        const meaning = termMeaning.substring(colonIndex + 1).trim()
        const spinner = (await import('ora')).default({ text: 'Creating blip...', spinner: 'dots' }).start()
        const result = await createBlipGlossary(term, meaning)
        if (result.error) {
          spinner.fail(chalk.red(result.error))
          process.exit(1)
        }
        spinner.succeed(chalk.green(`Created ${result.data!.blip.blip_serial}`))
        break
      }
      case 'list-byte': {
        const result = await listBytes()
        if (result.error) {
          renderErrorBox(result.error)
          process.exit(1)
        }
        renderBytesTable(result.data!.bytes)
        break
      }
      case 'list-blip': {
        const result = await listBlipsGlossary()
        if (result.error) {
          renderErrorBox(result.error)
          process.exit(1)
        }
        renderBlipsGlossaryTable(result.data!.blips)
        break
      }
      case 'get-byte': {
        const { serial } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Byte serial:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          }
        ])
        const result = await getByte(serial)
        if (result.error) {
          renderErrorBox(result.error)
          process.exit(1)
        }
        renderByteBox(result.data!.byte)
        break
      }
      case 'get-blip': {
        const { serial } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Blip serial:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          }
        ])
        const result = await getBlipGlossary(serial)
        if (result.error) {
          renderErrorBox(result.error)
          process.exit(1)
        }
        renderBlipGlossaryBox(result.data!.blip)
        break
      }
      case 'edit-byte': {
        if (!hasApiKey()) {
          renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
          process.exit(1)
        }
        const { serial, content } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Byte serial to edit:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          },
          {
            type: 'input',
            name: 'content',
            message: 'New content:',
            validate: (input: string) => {
              if (!input.trim()) return 'Content is required'
              if (input.length > 280) return 'Content must be 280 characters or less'
              return true
            }
          }
        ])
        const spinner = (await import('ora')).default({ text: 'Updating byte...', spinner: 'dots' }).start()
        const result = await updateByte(serial, content.trim())
        if (result.error) {
          spinner.fail(chalk.red(result.error))
          process.exit(1)
        }
        spinner.succeed(chalk.green(`Updated ${serial}`))
        break
      }
      case 'edit-blip': {
        if (!hasApiKey()) {
          renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
          process.exit(1)
        }
        const { serial, termMeaning } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Blip serial to edit:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          },
          {
            type: 'input',
            name: 'termMeaning',
            message: 'New term:meaning:',
            validate: (input: string) => {
              if (!input.includes(':')) return 'Use "term:meaning" format'
              const colonIndex = input.indexOf(':')
              if (!input.substring(0, colonIndex).trim()) return 'Term is required'
              if (!input.substring(colonIndex + 1).trim()) return 'Meaning is required'
              return true
            }
          }
        ])
        const colonIndex = termMeaning.indexOf(':')
        const term = termMeaning.substring(0, colonIndex).trim()
        const meaning = termMeaning.substring(colonIndex + 1).trim()
        const spinner = (await import('ora')).default({ text: 'Updating blip...', spinner: 'dots' }).start()
        const result = await updateBlipGlossary(serial, term, meaning)
        if (result.error) {
          spinner.fail(chalk.red(result.error))
          process.exit(1)
        }
        spinner.succeed(chalk.green(`Updated ${serial}`))
        break
      }
      case 'delete-byte': {
        if (!hasApiKey()) {
          renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
          process.exit(1)
        }
        const { serial } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Byte serial to delete:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          }
        ])
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Delete byte ${chalk.cyan(serial)}?`,
            default: false
          }
        ])
        if (!confirm) {
          console.log(chalk.gray('Cancelled'))
          break
        }
        const spinner = (await import('ora')).default({ text: 'Deleting...', spinner: 'dots' }).start()
        const result = await deleteByte(serial)
        if (result.error) {
          spinner.fail(chalk.red(result.error))
          process.exit(1)
        }
        spinner.succeed(chalk.green(`Deleted ${serial}`))
        break
      }
      case 'delete-blip': {
        if (!hasApiKey()) {
          renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
          process.exit(1)
        }
        const { serial } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Blip serial to delete:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          }
        ])
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Delete blip ${chalk.cyan(serial)}?`,
            default: false
          }
        ])
        if (!confirm) {
          console.log(chalk.gray('Cancelled'))
          break
        }
        const spinner = (await import('ora')).default({ text: 'Deleting...', spinner: 'dots' }).start()
        const result = await deleteBlipGlossary(serial)
        if (result.error) {
          spinner.fail(chalk.red(result.error))
          process.exit(1)
        }
        spinner.succeed(chalk.green(`Deleted ${serial}`))
        break
      }
      case 'config': {
        const config = getConfig()
        renderConfigBox(config)
        const { setting } = await inquirer.prompt([
          {
            type: 'list',
            name: 'setting',
            message: 'What would you like to configure?',
            choices: [
              { name: 'Set API key', value: 'key' },
              { name: 'Set API URL', value: 'url' },
              { name: 'Back', value: 'back' }
            ]
          }
        ])
        if (setting !== 'back') {
          const { value } = await inquirer.prompt([
            {
              type: 'input',
              name: 'value',
              message: `Enter ${setting}:`,
              validate: (input: string) => input.trim().length > 0 || 'Value is required'
            }
          ])
          setConfig(setting, value)
          renderSuccessBox(`${setting} saved`)
        }
        break
      }
      case 'exit':
        console.log(chalk.gray('Bye!'))
        break
    }
  })

program
  .command('config')
  .description('Manage configuration')
  .argument('[action]', 'set or list')
  .argument('[key]', 'config key (key or url)')
  .argument('[value]', 'config value')
  .action(async (action?: string, key?: string, value?: string) => {
    if (!action || action === 'list') {
      const config = getConfig()
      renderConfigBox(config)
      return
    }

    if (action === 'set' && key && value) {
      if (key !== 'key' && key !== 'url') {
        renderErrorBox('Invalid config key', 'Use "key" or "url"')
        process.exit(1)
      }
      setConfig(key, value)
      renderSuccessBox(`${key} saved`)
      return
    }

    renderErrorBox('Invalid usage', 'blip config set <key|url> <value>\n       blip config list')
    process.exit(1)
  })

async function handleDefaultCommand(args: string[], jsonMode: boolean): Promise<void> {
  if (args.length === 0) {
    const result = await listBytes()
    if (result.error) {
      renderErrorBox(result.error)
      process.exit(1)
    }
    renderBytesTable(result.data!.bytes)
    return
  }

  if (args.length === 1 && SERIAL_PATTERN.test(args[0])) {
    const result = await getByte(args[0])
    if (result.error) {
      renderErrorBox(result.error)
      process.exit(1)
    }
    if (jsonMode) {
      console.log(JSON.stringify(result.data!.byte, null, 2))
      return
    }
    renderByteBox(result.data!.byte)
    return
  }

  if (!hasApiKey()) {
    renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
    process.exit(1)
  }

  const content = args.join(' ')
  if (content.length > 280) {
    renderErrorBox('Content must be 280 characters or less')
    process.exit(1)
  }

  const spinner = (await import('ora')).default({ text: 'Creating byte...', spinner: 'dots' }).start()
  const result = await createByte(content.trim())
  if (result.error) {
    spinner.fail(chalk.red(result.error))
    process.exit(1)
  }
  spinner.succeed(chalk.green(`Created ${result.data!.byte.byte_serial}`))
  const byte = result.data!.byte
  console.log()
  console.log(chalk.gray('   ') + chalk.cyan.bold(byte.byte_serial) + chalk.gray(' │ ') + chalk.white(byte.content) + chalk.gray(' │ ') + formatTimeAgo(byte.created_at))
}

program
  .argument('[args...]', 'Serial to view, or content to create')
  .option('--json', 'Output as JSON (for list/get)')
  .action(async (args: string[], options: { json?: boolean }) => {
    await handleDefaultCommand(args || [], options.json || false)
  })

function renderByteBox(byte: Byte): void {
  const content = boxen(
    `${chalk.cyan.bold(byte.byte_serial)} ${chalk.gray('│')} ${chalk.white(byte.content)}\n\n${chalk.gray('Created: ')}${formatFullDate(byte.created_at)}`,
    {
      padding: 1,
      margin: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'cyan',
      title: chalk.bold('byte'),
      titleAlignment: 'center'
    }
  )
  console.log()
  console.log(content)
  console.log()
}

function renderBytesTable(bytes: Byte[]): void {
  if (bytes.length === 0) {
    console.log()
    console.log(chalk.gray('  No bytes yet. Create one with:'))
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

  for (const byte of bytes) {
    table.push([
      chalk.cyan.bold(byte.byte_serial),
      byte.content.length > 47 ? byte.content.substring(0, 44) + '...' : byte.content,
      formatTimeAgo(byte.created_at)
    ])
  }

  console.log()
  console.log(chalk.bold(`  Bytes (${bytes.length})`))
  console.log()
  console.log(table.toString())
  console.log()
}

function renderBlipGlossaryBox(blip: Blip): void {
  const content = boxen(
    `${chalk.cyan.bold(blip.blip_serial)} ${chalk.gray('│')} ${chalk.yellow(blip.term)}${chalk.gray(':')}${chalk.white(blip.meaning)}\n\n${chalk.gray('Created: ')}${formatFullDate(blip.created_at)}`,
    {
      padding: 1,
      margin: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'yellow',
      title: chalk.bold('blip'),
      titleAlignment: 'center'
    }
  )
  console.log()
  console.log(content)
  console.log()
}

function renderBlipsGlossaryTable(blips: Blip[]): void {
  if (blips.length === 0) {
    console.log()
    console.log(chalk.gray('  No blips yet. Create one with:'))
    console.log(chalk.gray('  ') + chalk.cyan('blip blip add "term:meaning"'))
    console.log()
    return
  }

  const table = new Table({
    head: [chalk.gray('serial'), chalk.gray('term'), chalk.gray('meaning'), chalk.gray('ago')],
    colWidths: [8, 20, 30, 8],
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
      blip.term.length > 17 ? blip.term.substring(0, 14) + '...' : blip.term,
      blip.meaning.length > 27 ? blip.meaning.substring(0, 24) + '...' : blip.meaning,
      formatTimeAgo(blip.created_at)
    ])
  }

  console.log()
  console.log(chalk.bold(`  Blips (${blips.length})`))
  console.log()
  console.log(table.toString())
  console.log()
}

program.parse(process.argv)
