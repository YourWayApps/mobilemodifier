import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function POST(req) {
  const { textColor, newRepoName } = await req.json();

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const owner = 'YourWayApps';  // Organization name
  const repo = 'MobileTemplate'; // Original repository name

  try {
    // Step 1: Fork the repository with a new name
    const forkResponse = await octokit.repos.createFork({
      owner,
      repo,
      name: newRepoName, // Specify the new name for the forked repository
      organization: owner, // Fork into the organization
      default_branch_only: false, // Fork all branches (change to true if only the default branch is needed)
      headers: {
        accept: 'application/vnd.github+json', // Recommended header
      }
    });

    const forkedRepoFullName = `${owner}/${newRepoName}`;

    // Wait for the fork to be fully created
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds delay

    // Step 2: Fetch the current content of the config.json file in the forked repo
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo: newRepoName, // Use the new name here
      path: 'assets/config.json',
    });

    // Decode the file content
    const content = Buffer.from(file.content, 'base64').toString();
    const config = JSON.parse(content);

    // Update the textColor in config.json
    config.textColor = textColor;

    // Step 3: Update the config.json file in the forked repo
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: newRepoName,
      path: 'assets/config.json',
      message: 'Update config.json',
      content: Buffer.from(JSON.stringify(config, null, 2)).toString('base64'),
      sha: file.sha, // Existing file's SHA
    });

    // Optionally trigger a workflow to build and deploy the forked repository
    await octokit.actions.createWorkflowDispatch({
      owner,
      repo: newRepoName,
      workflow_id: 'build-and-deploy.yml', // Workflow file name
      ref: 'main', // Branch to run the workflow
    });

    return NextResponse.json({ message: 'Config updated and build triggered successfully!' });
  } catch (error) {
    console.error('Error updating config.json:', error);
    return NextResponse.json({ message: 'Error updating config.json' }, { status: 500 });
  }
}
