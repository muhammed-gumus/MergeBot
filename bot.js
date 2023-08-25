const axios = require('axios');
const fs = require('fs');
const moment = require('moment');

const repoOwner = 'kamp-us';
const repoName = 'monorepo';
const outputFilePath = '2023.08.12-2023.08.26.md';

const startDate = '2023-08-12T00:00:00Z';
const endDate = '2023-08-26T23:59:59Z';

const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls?state=closed&sort=created&direction=desc`;

const generateMarkdown = async (pullRequests) => {
  let markdown = '';

  for (const pr of pullRequests) {
    markdown += `## [${pr.title}](${pr.html_url})\n\n`;
    markdown += `##${pr.body}\n`;
    
    const contributor = await getContributor(pr.user.login);
    markdown += `### Contributor: [${contributor.login}](${contributor.html_url})\n`;
    
    markdown += `### Link: ${pr.html_url}\n`;
    markdown += `-----\n`;
  }

  return markdown;
};

const getContributor = async (login) => {
  const response = await axios.get(`https://api.github.com/users/${login}`);
  return response.data;
};

axios.get(apiUrl)
  .then(async (response) => {
    const closedPullRequests = response.data.filter((pr) => {
      const closedAt = moment(pr.closed_at);
      return closedAt.isBetween(startDate, endDate);
    });

    const markdownContent = await generateMarkdown(closedPullRequests);

    fs.writeFile(outputFilePath, markdownContent, (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log(`File "${outputFilePath}" created successfully.`);
      }
    });
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });
