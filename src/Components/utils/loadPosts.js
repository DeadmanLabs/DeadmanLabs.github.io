import path from 'path';

export async function getAllPosts() {
  const context = require.context('../../Posts', true, /overview\.json$/);
  const posts = await Promise.all(
    context.keys().map(async (key) => {
      const postDir = key.replace('/overview.json', '');
      const overview = await fetch(context(key)).then((res) => res.json());
      const postContent = await fetch(`${postDir}/post.md`).then((res) => res.text());

      return {
        id: postDir.split('/').pop(),
        ...overview,
        content: postContent,
      };
    })
  );

  return posts;
}