const core = require('@actions/core')
const github = require('@actions/github')
const fetch = require('node-fetch')

async function getRequest(url) {
  // Sends a GET request to Teamwork to 
  const getOpts = {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${core.getInput('api_key')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow'
  }

  let response = await fetch(url, getOpts)
  if (response.status != 200) {
    core.setFailed('Server returned ' + response.status)
    process.exit(1)
  } else {
    return await response.json()
  }
}

async function patchRequest(url, body) {
  // Sends a PATCH request to Teamwork to 
  const patchOpts = {
    method: 'PATCH',
    headers: {
      'Authorization': `Basic ${core.getInput('api_key')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: body
  }

  let response = await fetch(url, patchOpts)
  if (response.status != 200) {
    core.setFailed('Server returned ' + response.status)
    process.exit(1)
  }
}

async function putRequest(url, body) {
  // Sends a PUT request to Teamwork to 
  const putOpts = {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${core.getInput('api_key')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: body
  }

  let response = await fetch(url, putOpts)
  if (response.status != 200) {
    core.setFailed('Server returned ' + response.status)
    process.exit(1)
  }
}

module.exports = {getRequest, patchRequest, putRequest}