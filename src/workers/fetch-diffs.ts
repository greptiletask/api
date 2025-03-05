// lib/github.ts
import axios from "axios";
import { GITHUB_API_URL } from "../utils/constants";

export async function fetchCommits({
  start,
  end,
  owner,
  repo,
  token,
}: {
  start: string;
  end: string;
  owner: string;
  repo: string;
  token: string;
}) {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?since=${start}&until=${end}`;

  const { data } = await axios.get(url, {
    headers: {
      Authorization: `token ${token}`,
    },
  });

  return data;
}

export async function fetchCommitDiffs(
  commitSha: string,
  owner: string,
  repo: string,
  token: string
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3.diff",
    },
  });


  return data;
}
