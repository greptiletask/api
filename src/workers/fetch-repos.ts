// lib/github.ts
import axios from "axios";
import { GITHUB_API_URL } from "../utils/constants";

/**
 * Fetch all repositories for the authenticated user via GitHub API.
 * @param token - The GitHub personal access token or OAuth access token.
 * @param perPage - Number of repos to fetch per page (up to 100).
 * @returns An array of repository objects from GitHub.
 */
export async function fetchUserRepos(
  token: string,
  perPage = 100
): Promise<any[]> {
  const baseUrl = `${GITHUB_API_URL}/user/repos`;

  let page = 1;
  let allRepos: any[] = [];
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

    if (!data?.length) {
      hasMore = false;
    } else {
      allRepos = allRepos.concat(data);
      page += 1;
    }
  }

  return allRepos;
}
