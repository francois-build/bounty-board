
import React, { useState, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getFunctions, httpsCallable } from "firebase/functions";
import ChallengeCard from "../components/ChallengeCard";

const searchOrPivot = httpsCallable(getFunctions(), "searchOrPivot");

const BrowseChallenges = () => {
  const [search, setSearch] = useState("*");
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["challenges", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchOrPivot({
        q: search,
        query_by: "title,description",
        filter_by: "isStealth:false",
        page: pageParam,
      });
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hits.length < 20) return undefined;
      return pages.length + 1;
    },
  });

  React.useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div className="container mx-auto p-4">
      <input
        type="text"
        placeholder="Search challenges..."
        onChange={(e) => setSearch(e.target.value || "*")}
        className="w-full p-2 border rounded mb-4"
      />

      {status === "loading" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <p>Error fetching challenges.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.hits.map((hit) => (
                  <ChallengeCard key={hit.document.id} challenge={hit.document} />
                ))}
              </React.Fragment>
            ))}
          </div>
          <div ref={ref} className="h-10">
            {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : ""}
          </div>
        </>
      )}
    </div>
  );
};

export default BrowseChallenges;
