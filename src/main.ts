import * as core from '@actions/core'
import { Client } from '@notionhq/client'
import { Octokit } from 'octokit'
// import { createActionAuth } from "@octokit/auth-action";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const notion = new Client({
      auth: core.getInput('notion_token')
    })

    const octokit = new Octokit({
      auth: core.getInput('octokit_token')
    })

    const storyUrl = core.getInput('storyUrl')
    const prNumber = core.getInput('pr_number')
    const owner = core.getInput('repo').split('/', 2)[0]
    const repo = core.getInput('repo').split('/', 2)[1]

    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: Number(prNumber)
    })
    const regex = /\/([0-9a-fA-F]+)\?/
    const match = JSON.stringify(comments[0].body).match(regex)
    if (match) {
      const result = match[1]
      const test = result
      core.info(`matching id: ${test}`)

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
                    content: `Lien de la story : ${storyUrl}`
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

      core.info(`url: ${storyUrl}`)
      core.info(`pr: ${prNumber}`)
      core.info(`test: ${test}`)
      core.info(`lastOrderedIn2023: ${JSON.stringify(lastOrderedIn2023)}`)

      // Set outputs for other workflow steps to use
      core.setOutput('time', new Date().toTimeString())
    } else {
      throw new Error('No matching notion url found')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
