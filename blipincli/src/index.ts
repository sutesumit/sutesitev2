#!/usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { newCommand } from './commands/new.js'
import { listCommand } from './commands/list.js'
import { getCommand } from './commands/get.js'
import { editCommand } from './commands/edit.js'
import { deleteCommand } from './commands/delete.js'
import { getConfig, setConfig, hasApiKey } from './lib/config.js'
import { showBanner, renderConfigBox, renderSuccessBox, renderErrorBox } from './lib/ui.js'

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
  .description('CLI for managing blips')
  .version('1.0.0')

program
  .command('add <content...>')
  .description('Create a new blip')
  .alias('new')
  .action(async (contentParts: string[]) => {
    if (!hasApiKey()) {
      renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
      process.exit(1)
    }
    await newCommand(contentParts.join(' '))
  })

program
  .command('ls')
  .description('List all blips')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    await listCommand(options)
  })

program
  .command('rm <serial>')
  .description('Delete a blip')
  .option('-f, --force', 'Skip confirmation')
  .action(async (serial: string, options: { force?: boolean }) => {
    await deleteCommand(serial, options)
  })

program
  .command('edit <serial> [content...]')
  .description('Edit a blip')
  .alias('e')
  .action(async (serial: string, contentParts: string[] = []) => {
    await editCommand(serial, contentParts.join(' '))
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
          { name: 'Create a new blip', value: 'create' },
          { name: 'View all blips', value: 'list' },
          { name: 'View a specific blip', value: 'get' },
          { name: 'Edit a blip', value: 'edit' },
          { name: 'Delete a blip', value: 'delete' },
          { name: 'Configure settings', value: 'config' },
          new inquirer.Separator(),
          { name: 'Exit', value: 'exit' }
        ]
      }
    ])

    switch (action) {
      case 'create': {
        if (!hasApiKey()) {
          renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
          process.exit(1)
        }
        const { content } = await inquirer.prompt([
          {
            type: 'input',
            name: 'content',
            message: 'Blip content:',
            validate: (input: string) => {
              if (!input.trim()) return 'Content is required'
              if (input.length > 280) return 'Content must be 280 characters or less'
              return true
            }
          }
        ])
        await newCommand(content)
        break
      }
      case 'list':
        await listCommand({})
        break
      case 'get': {
        const { serial } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Blip serial:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          }
        ])
        await getCommand(serial, {})
        break
      }
      case 'edit': {
        const { serial } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Blip serial to edit:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          }
        ])
        await editCommand(serial)
        break
      }
      case 'delete': {
        const { serial } = await inquirer.prompt([
          {
            type: 'input',
            name: 'serial',
            message: 'Blip serial to delete:',
            validate: (input: string) => SERIAL_PATTERN.test(input) || 'Invalid serial format'
          }
        ])
        await deleteCommand(serial, {})
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
  const arg = args.join(' ')

  if (args.length === 0) {
    await listCommand({ json: jsonMode })
    return
  }

  if (args.length === 1 && SERIAL_PATTERN.test(args[0])) {
    await getCommand(args[0], { json: jsonMode })
    return
  }

  if (!hasApiKey()) {
    renderErrorBox('API key not configured', 'Run: blip config set key <your-key>')
    process.exit(1)
  }

  await newCommand(arg)
}

program
  .argument('[args...]', 'Serial to view, or content to create')
  .option('--json', 'Output as JSON (for list/get)')
  .action(async (args: string[], options: { json?: boolean }) => {
    await handleDefaultCommand(args || [], options.json || false)
  })

program.parse(process.argv)
