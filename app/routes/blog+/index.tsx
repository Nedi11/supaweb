import { Link } from "@remix-run/react";

import { getSortedPostsData } from "~/utils/blog.server";
import { superjson, useSuperLoaderData } from "~/utils/superjson";

export async function loader() {
  const allPosts = getSortedPostsData();
  return superjson({ allPosts });
}

export default function Blog() {
  const { allPosts } = useSuperLoaderData<typeof loader>();
  return (
    <div className="px-2 max-w-2xl mx-auto flex flex-col gap-5">
      {allPosts.map((post, index) => {
        return (
          <>
            <Link to={`/blog/${post.id}`} className=" flex flex-col">
              <h3 className="font-bold text-xl">{post.title}</h3>
              <p>{post.date}</p>
            </Link>
            {}
            {index != allPosts.length - 1 && (
              <div className="w-full h-[1px] bg-gray-500"></div>
            )}
          </>
        );
      })}
    </div>
  );
}
