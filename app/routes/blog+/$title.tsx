import { LoaderFunctionArgs } from "@remix-run/node";
import { getPost, getSortedPostsData } from "~/utils/blog.server";
import { redirect, superjson, useSuperLoaderData } from "~/utils/superjson";
import ReactMarkdown from "react-markdown";

import { Link } from "@remix-run/react";
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const title = params.title as string;
  const post = getPost({ id: title });
  if (!post) return redirect("/404");
  const date = new Date(post.date);
  return superjson({ post: post, date: date });
}
export default function BlogPost() {
  const { post, date } = useSuperLoaderData<typeof loader>();
  return (
    <>
      <div className="flex md:flex-row flex-col fle w-full justify-center pt-20 gap-10">
        <div
          className={
            "min-h-screen p-2 md:p-0 w-full prose-lg prose dark:prose-invert break-words"
          }
        >
          <h1>{post.title}</h1>
          <div className="flex items-center h-5 w-full space-x-4 text-sm  mb-10">
            <p>SUPAWEB</p>
            <div className="h-full w-[1px] bg-gray-500"></div>
            <p>
              Updated: {month[date.getMonth()]} {date.getDate()},{" "}
              {date.getFullYear()}
            </p>

            <div className="h-full w-[1px] bg-gray-500"></div>
            <p> {post.readTime}</p>
          </div>

          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </>
  );
}
