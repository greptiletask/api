import axios from "axios";
import { GITHUB_API_URL } from "../utils/constants";

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
