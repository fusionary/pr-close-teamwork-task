const core = require('@actions/core')
const github = require('@actions/github')
const {getRequest, patchRequest, putRequest, postRequest} = require('./functions.js')

async function moveCard(columnName) {
  // Sends a GET request to Teamwork to find the "qa on staging" column
  let columnID = 0
  const boardEndpoint = '/projects/'
  let boardUrl = 'https://' + core.getInput('domain') + boardEndpoint + projectID + '/boards/columns.json'
  const columns = await getRequest(boardUrl)
  columnID = columns.find(column => column.name.toLowerCase() == columnName).id

  // Check if the task has a card
  if (task.task.card !== null) {
    // Sends a PUT request to Teamwork to move the card to the "code review" column
    const cardEndpoint = '/boards/columns/cards/'
    let cardUrl = 'https://' + core.getInput('domain') + cardEndpoint + cardID + 'move.json'
    await putRequest(cardUrl, '{"cardId": ' + task.task.card.id + ',"positionAfterId": 0, "columnId": ' + columnID + '}')
  } else {
    await postRequest(cardUrl, '{"card": {"taskId": ' + taskID + '},"positionAfterId": 0}')
  }
}

let taskID = core.getInput('task_id')
if (!taskID) {
  // No task override. Look for task id in PR description
  const prBody = github.context.payload.pull_request?.body
  if (prBody) {
    taskID = prBody.slice(0, prBody.indexOf('\n')).replace('#', '')
    // If there's no description or the first line isn't a task id
    if (taskID === '' || isNaN(parseInt(taskID))) {
      // Description may have been intentionally left empty or not include
      // a task id. Exit with success code
      process.exit(0)
    }
  } else {
    core.setFailed('Could not retrieve PR body')
    process.exit(0)
  }
}

core.info('Found task ID ' + taskID)

// Sends a GET request to Teamwork to retrieve info about the task
const taskEndpoint = '/projects/api/v3/tasks/'
let taskUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '.json'
getRequest(taskUrl)
  .then(async task => {
    switch (github.context.payload.action) {
      case 'opened':
        core.info('PR Opened')  
      
        // Sends a GET request to Teamwork to find the "code review" tag
        const tagEndpoint = '/projects/api/v3/tags/'
        let tagUrl = 'https://' + core.getInput('domain') + tagEndpoint + taskID + 'tags.json?projectIds=0&searchTerm=code review'
        const tag = await getRequest(tagUrl)
        if (tag.tags.length > 0) {
          const tagID = tag.tags[0].id

          // Sends a PUT request to Teamwork to add the "code review" tag to the task
          let taskTagUrl = 'https://' + core.getInput('domain') + taskEndpoint + taskID + '/tags.json'
          await putRequest(taskTagUrl, `{"replaceExistingTags": false, "tagIds": [${tagID}]}`)
        }

        moveCard('code review')
        break;

      case 'closed':
        core.info('PR Opened')  
      
        moveCard('qa on stg')
        break;

      default:
        core.info('Unrecognized action ' + github.context.action)  
      
        break;
    }

  core.info('Successfully updated task')
  })
