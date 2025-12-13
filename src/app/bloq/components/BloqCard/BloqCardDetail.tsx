import Link from "next/link";
import { motion as m, AnimatePresence } from "framer-motion";
import { Undo2 } from "lucide-react";
import { BloqPost } from "@/lib/bloq";
import { cn } from "@/lib/utils";
import { useCardCollapse } from "../../hooks/useCardCollapse";
import { BloqDate, BloqTitle, BloqSummary, BloqBackground } from "./parts";
import TagList from "../TagList";
import ViewCounter from "../ViewCounter";

interface BloqCardDetailProps {
  post: BloqPost;
  className?: string;
}

export const BloqCardDetail = ({ post, className }: BloqCardDetailProps) => {
  const { isCollapsed, mouseHandlers } = useCardCollapse();

  return (
    <m.div
      {...mouseHandlers}
      initial="rest"
      animate="rest"
      whileHover="hover"
      transition={{ duration: 0.3, ease: "easeInOut" }}
      role="article"
      aria-label={post.title}
      className={cn(
        "relative p-2 overflow-hidden blue-border col-span-1 flex flex-col cursor-pointer",
        className
      )}
    >
      <BloqBackground />

      <m.div
        animate={{
          paddingLeft: isCollapsed ? "1.5rem" : "0.5rem",
          paddingRight: isCollapsed ? "1.5rem" : "0.5rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`flex h-full flex-col ${
          isCollapsed ? "items-center justify-center" : ""
        }`}
      >
        {/* Back button & collapsed title */}
        <div className="flex flex-row w-full items-center justify-between overflow-hidden">
          <Link href={`/bloq/`} className="flex shrink-0">
            <div className="inline-flex items-center blue-border rounded px-2 lowercase opacity-75 text-xs hover:bg-blue-100 hover:text-black dark:hover:bg-blue-900 dark:hover:text-white transition-colors duration-500">
              {isCollapsed ? "" : "All Bloqs"}{" "}
              <Undo2 className="opacity-75 p-1" />
            </div>
          </Link>
          <AnimatePresence>
            {isCollapsed ? (
              <m.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-grow inline-block truncate font-medium text-blue-900 dark:text-blue-400 ml-2 text-right"
              >
                {post.title}
              </m.div>
            ) : (
              <ViewCounter
                slug={post.url}
                className="text-xs opacity-60 flex items-center text-gray-500"
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <m.div
              className="pt-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <BloqDate post={post} />
              <BloqTitle post={post} isDetail={true} />
              <BloqSummary post={post} isDetail={true} />

              {/* Tags section */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <TagList tags={post.tags} asLinks={true} />
                </div>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </m.div>
  );
};
