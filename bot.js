const axios = require("axios");
const fs = require("fs");
const moment = require("moment");
const readline = require("readline");

const rl = readline.createInterface(process.stdin, process.stdout);

rl.question("Repository owner:  ", function (owner) {
  rl.question("Repository name: ", function (name) {
    rl.question("File name: ", function (fname) {
      const repoOwner = owner; //The owner of the repository you want to access
      const repoName = name; //The name of the repository you want to access
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls?state=closed&sort=created&direction=desc`;
      const outputFilePath = `${fname}.md`; //Edit the filename to be created as in the example
      axios
        .get(apiUrl)
        .then(async (response) => {
          const closedPullRequests = response.data.filter((pr) => {
            const closedAt = moment(pr.closed_at);
            return closedAt.isBetween(startDate, endDate);
          });

          const markdownContent = await generateMarkdown(closedPullRequests);

          fs.writeFile(outputFilePath, markdownContent, (err) => {
            if (err) {
              console.error("Error writing file:", err);
            } else {
              console.log(`File "${outputFilePath}" created successfully.`);
            }
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
      rl.close();
    });
  });
});

const startDate = "2023-08-12T00:00:00Z"; //Set the start date in the date range you want to access
const endDate = "2023-08-26T23:59:59Z"; //Set the first date in the date range you want to access

const generateMarkdown = async (pullRequests) => {
  let markdown = "";

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
