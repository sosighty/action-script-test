import * as core from '@actions/core'
// import { Client } from '@notionhq/client'
import { wait } from './wait'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Initializing a client
    // const notion = new Client({
    //   auth: core.getInput('notion_key')
    // })
    const key = core.getInput('notion_key')
    const ms: string = core.getInput('milliseconds')
    const url = core.getInput('storybook_url')
    core.debug(url)

    // const listUsersResponse = await notion.users.list({})
    // core.debug(listUsersResponse.results[0].name ?? 'No name')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
    core.setOutput('key', key)
    core.setOutput('url', url)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
