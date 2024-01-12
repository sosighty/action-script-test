import * as core from '@actions/core'
import { Client } from '@notionhq/client'
import { wait } from './wait'
import { Octokit } from 'octokit'
// import { createActionAuth } from "@octokit/auth-action";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const notion = new Client({
      auth: 'secret_qxTVkGULmKUXuau5t2izqWhciJTWzOjfpfu1zcRyBOs'
    })

    const octokit = new Octokit({
      auth: core.getInput('octokit_token')
    })

    // Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
    const {
      data: { login }
    } = await octokit.rest.users.getAuthenticated()

    const ms: string = core.getInput('milliseconds')
    const key = core.getInput('notion_key')
    const url = core.getInput('storybook_url')
    const pr = core.getInput('pr_number')

    const { data: comments } = await octokit.rest.issues.listComments({
      owner: 'sosighty',
      repo: 'action-script-test',
      issue_number: 3
    })

    const test = JSON.stringify(comments[0].body)
      .split('?', 2)[0]
      .split('.so/', 2)[1]
      .split('-', 2)[1]

    await notion.blocks.children.append({
      block_id: test,
      children: [
        {
          heading_2: {
            rich_text: [
              {
                text: {
                  content: 'Recettage'
                }
              }
            ]
          }
        },
        {
          paragraph: {
            rich_text: [
              {
                text: {
                  content: `Lien de la story : ${url}`
                }
              }
            ]
          }
        }
      ]
    })

    const lastOrderedIn2023 = await notion.blocks.children.list({
      block_id: test
    })

    core.info(`key: ${key}`)
    core.info(`url: ${url}`)
    core.info(`pr: ${pr}`)
    core.info(`login: ${login}`)
    core.info(`test: ${test}`)
    core.info(`lastOrderedIn2023: ${JSON.stringify(lastOrderedIn2023)}`)

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
