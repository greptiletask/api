import axios from "axios";
import { GITHUB_API_URL } from "../utils/constants";
import { isExcluded } from "../utils/excludedFiles";

export async function fetchCommits({
  start,
  end,
  owner,
  repo,
  token,
  branch,
}: {
  start: string;
  end: string;
  owner: string;
  repo: string;
  token: string;
  branch: string;
}) {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?since=${start}&until=${end}${
    branch ? `&sha=${branch}` : ""
  }`;

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
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/commits/${commitSha}`;

  const { data: diffText } = await axios.get(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3.diff",
    },
    responseType: "text",
  });

  const filteredDiff = filterDiff(diffText);

  return filteredDiff;
}

/**
 * Splits the unified diff into file-based chunks and removes any chunk
 * whose file path matches `isExcluded`.
 */
function filterDiff(diff: string): string {
  const lines = diff.split("\n");

  let includedDiff: string[] = [];
  let currentFileLines: string[] = [];
  let currentFilePath = "";

  const pushIfIncluded = () => {
    if (currentFilePath && !isExcluded(currentFilePath)) {
      includedDiff.push(...currentFileLines);
    }
  };

  for (const line of lines) {
    if (line.startsWith("diff --git a/")) {
      if (currentFileLines.length > 0) {
        pushIfIncluded();
      }

      currentFileLines = [line];

      const match = line.match(/^diff --git a\/(.*) b\/(.*)$/);
      if (match) {
        currentFilePath = match[1] || "";
      } else {
        currentFilePath = "";
      }
    } else {
      currentFileLines.push(line);
    }
  }

  if (currentFileLines.length > 0) {
    pushIfIncluded();
  }

  return includedDiff.join("\n");
}
