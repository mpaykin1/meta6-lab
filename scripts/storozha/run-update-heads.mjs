import {updateHeads} from './update-heads.mjs';
import {openPulls} from './gh-list.mjs';

const repo = process.env.STOROZHA_REPO;
const token = process.env.STOROZHA_TOKEN;
const updateToken = process.env.STOROZHA_UPDATE_TOKEN;
if (repo !== 'mpaykin1/meta6-lab' || !token) throw Error('Only trusted meta6-lab is writable');
function client(credential) {
  return async (path, method = 'GET', body) => {
    const response = await fetch('https://api.github.com/repos/' + repo + path, {
      method,
      headers: {Authorization: 'Bearer ' + credential, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'},
      ...(body === undefined ? {} : {body: JSON.stringify(body)})
    });
    const json = await response.json();
    if (!response.ok) {
      const error = Error(method + ' ' + path + ': HTTP ' + response.status + ' ' + json.message);
      error.status = response.status;
      throw error;
    }
    return json;
  };
}
await updateHeads({repo, prs: await openPulls(repo, token), api: client(token),
  updateApi: updateToken ? client(updateToken) : null});
