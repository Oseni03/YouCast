import React from "react";
import { Button } from "@/components/ui/button";

const Pagination = ({ page, setPage, isLoading }) => (
	<div className="flex my-3">
		<div className="ml-auto space-x-2 ">
			<Button
				variant="outline"
				size="sm"
				onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
				disabled={page === 1 || isLoading}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setPage((prevPage) => prevPage + 1)}
				disabled={isLoading}
			>
				Next
			</Button>
		</div>
	</div>
);

export default Pagination;
