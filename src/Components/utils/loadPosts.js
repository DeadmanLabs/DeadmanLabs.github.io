export async function getAllPosts() {
  try {
    // Fetch the list of post IDs
    const response = await fetch('/Posts/postsList.json');
    const postsList = await response.json();

    // Fetch data for each post
    const posts = await Promise.all(
      postsList.map(async (postId) => {
        // Fetch the overview.json file
        const overviewResponse = await fetch(`/Posts/${postId}/overview.json`);
        const overview = await overviewResponse.json();

        // Fetch the post.md file
        const postContentResponse = await fetch(`/Posts/${postId}/post.md`);
        const postContent = await postContentResponse.text();

        // Return the post object
        return {
          id: postId,
          ...overview,
          content: postContent,
        };
      })
    );

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}