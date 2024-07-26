import nock from 'nock';
import urlJoin from 'url-join';

/**
 * Retun a `nock` object setup to respond to a GitLab authentication request. Other expectation and responses can be chained.
 *
 * @param {Object} [env={}] Environment variables.
 * @param {String} [gitlabToken=env.GL_TOKEN || env.GITLAB_TOKEN || 'GL_TOKEN'] The github token to return in the authentication response.
 * @param {String} [gitlabUrl=env.GL_URL || env.GITLAB_URL || 'https://api.github.com'] The url on which to intercept http requests.
 * @param {String} [gitlabApiPathPrefix=env.GL_PREFIX || env.GITLAB_PREFIX || ''] The GitHub Enterprise API prefix.
 * @return {Object} A `nock` object ready to respond to a github authentication request.
 */
export function authenticate (
  env = {},
  {
    gitlabToken = env.GL_TOKEN || env.GITLAB_TOKEN || 'GL_TOKEN',
    gitlabUrl = env.GL_URL || env.GITLAB_URL || 'https://gitlab.com',
    gitlabApiPathPrefix = typeof env.GL_PREFIX === 'string'
      ? env.GL_PREFIX
      : null || typeof env.GITLAB_PREFIX === 'string'
      ? env.GITLAB_PREFIX
      : null || '/api/v4',
  } = {}
) {
  return nock(urlJoin(gitlabUrl, gitlabApiPathPrefix), {reqheaders: {'Private-Token': gitlabToken}});
};

/**
 * @typedef {Object} GitlabUploadResponse
 * @property {String} alt - unclear. In practice this seems to be the filename uploaded with the path to the file stripped, but this does not match the documentation
 * @property {String} url - Unclear, documented as 	The ID or URL-encoded path of the project.
 * in practice, seems to be the path from the project's endpoint but only in the case of using project id
 * the latter may be an issue for private projects?
 * @property {String} full_path - The absolute path to the uploaded file
 * @property {String} markdown - alt property and url property formatted as a markdown link
 */

/**
 * Simulate gitlab abi v4 /projects/:id/uploads endpoint
 * https://docs.gitlab.com/ee/api/projects.html#upload-a-file
 *
 * @param {String} file The file to be uploaded.
 * @param {(String|Number)} id The ID or URL-encoded path of the project.
 * @return {GitlabUploadResponse}
 */
export function getUploadResponse (file, id = "unused as unreliable") {
  let split_file = file.split("/")
  file = split_file[split_file.length - 1]
  let upload_secret = "66dbcd21ec5d24ed6ea225176098d52b"; // Example pulled from documentation random per file
  let project_id = 4; // Example pulled from documentation, ID number of gitlab project
  let url = `/uploads/${upload_secret}/${file}`;
  return {
    alt: file,
    url: url,
    full_path: `/-/project/${project_id}${url}`,
    markdown: `[${file}](${url})`
  }
}
