import axios from "axios";
import { GITHUB_API_URL } from "../utils/constants";

// GITHUB_API_URL = "https://api.github.com";

export async function fetchUserRepos(
  token: string,
  perPage = 100
): Promise<{ id: number; fullName: string }[]> {
  const baseUrl = `${GITHUB_API_URL}/user/repos`;

  let page = 1;
  let allRepos: { id: number; fullName: string }[] = [];
  let hasMore = true;

  while (hasMore) {
    const { data } = await axios.get(baseUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        per_page: perPage,
        page,
      },
    });

    console.log(data, "DATA FROM FETCH USER REPOS");

    if (!data?.length) {
      hasMore = false;
    } else {
      const mapped = data.map((repo: any) => ({
        id: repo.id,
        fullName: repo.full_name,
      }));
      allRepos = [...allRepos, ...mapped];
      page += 1;
    }
  }

  return allRepos;
}

/**
 * Fetch all branches for a specific repository, using pagination.
 *
 * @param owner - The GitHub username or organization name
 * @param repo - The repository name
 * @param token - The GitHub personal access token
 * @param perPage - Number of branches to fetch per page (default = 100)
 * @returns An array of branch objects (currently returning only the `name` field)
 */
export async function fetchBranches(
  owner: string,
  repo: string,
  token: string,
  perPage = 100
): Promise<{ name: string }[]> {
  const baseUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/branches`;

  let page = 1;
  let allBranches: { name: string }[] = [];
  let hasMore = true;

  while (hasMore) {
    const { data } = await axios.get(baseUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        per_page: perPage,
        page,
      },
    });

    console.log(
      data,
      `DATA FROM FETCH BRANCHES for ${owner}/${repo} (page: ${page})`
    );

    if (!data?.length) {
      hasMore = false;
    } else {
      // Adjust the mapping if you need more branch fields
      const mapped = data.map((branch: any) => ({
        name: branch.name,
      }));
      allBranches = [...allBranches, ...mapped];
      page += 1;
    }
  }

  return allBranches;
}
