import SearchField from "@/components/SearchField"; // Adjust the path if necessary

export default async function RoutePage(props: PageParams) {
  const tags = await getPostsTags();
  const posts = await getPosts();

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Blog</LayoutTitle>
      </LayoutHeader>
      <LayoutContent className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag} href={`/posts/categories/${tag}`}>
            <Badge variant="outline">{tag}</Badge>
          </Link>
        ))}
      </LayoutContent>

      <div className="flex">
        {/* Main Content */}
        {posts.length === 0 ? (
          <LayoutContent className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center rounded-lg border-2 border-dashed p-4 lg:gap-6 lg:p-8">
              <FileQuestion />
              <Typography variant="h2">No posts found</Typography>
              <Link
                className={buttonVariants({ variant: "link" })}
                href="/posts"
              >
                View all posts
              </Link>
            </div>
          </LayoutContent>
        ) : (
          <LayoutContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </LayoutContent>
        )}

        {/* Right Panel */}
        <div className="ml-4 w-1/4">
          <SearchField />
          {/* You can add more components to the right panel here */}
        </div>
      </div>
    </Layout>
  );
}
