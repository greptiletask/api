export const prompt = (start: string, end: string, combinedDiffs: string) => `
You are an AI specialized in summarizing code changes.
We have a series of commits from ${start} to ${end}.
The diffs are:
""" 
${combinedDiffs}
"""
Please produce a concise bulleted list describing the changes,
focusing on externally visible(product level) changes which will matter to the customer, please do not include technical details of code implementation and changes.
For example, if the changes include refactoring the code, this is not a customer-facing change and should not be included in the changelog.
Also suggest a short, descriptive title for this changelog. 

Return your result in JSON with structure:
{
  "title": "...",
  "summaryBulletPoints": "This should be a concise summary of the changes in bullet points and in a markdown format, it MUST be a bullet point list with a new line between each bullet point"
}
`;
