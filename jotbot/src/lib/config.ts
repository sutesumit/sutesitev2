import Conf from 'conf'

const config = new Conf({
  projectName: 'jot',
  schema: {
    key: {
      type: 'string',
      default: ''
    },
    url: {
      type: 'string',
      default: 'https://sumitsute.com/api'
    }
  }
})

export type ConfigData = {
  key: string
  url: string
}

export function getConfig(): ConfigData {
  return {
    key: config.get('key') as string,
    url: config.get('url') as string
  }
}

export function setConfig(key: string, value: string): void {
  config.set(key, value)
}

export function hasApiKey(): boolean {
  const key = config.get('key') as string
  return !!key && key.trim().length > 0
}

export function clearConfig(): void {
  config.clear()
}

export default config
