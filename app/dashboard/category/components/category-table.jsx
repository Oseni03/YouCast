"use client";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DeleteDialog } from "@/components/delete-dialog";
import { toast } from "react-toastify";

const CategoryTable = ({ categories, setCategories }) => {
	const [isLoading, setLoading] = useState(false);

	const handleDeleteCategory = async (categoryId) => {
		try {
			setLoading(true);
			const response = await fetch(`/api/category/${categoryId}`, {
				method: "DELETE",
			});
			if (response.ok) {
				setCategories((prevCategories) =>
					prevCategories.filter(
						(category) => category.id !== categoryId
					)
				);
				toast.success("Category deleted successfully!");
			} else {
				toast.error("Failed to delete category.");
			}
		} catch (error) {
			toast.error("Error deleting category.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="">Name</TableHead>
					<TableHead className="text-right">ACTION</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{categories?.map((category) => (
					<TableRow key={category.id}>
						<TableCell className="font-medium">
							{category.name}
						</TableCell>
						<TableCell className="text-right">
							<DeleteDialog
								buttonLabel="Delete"
								handler={() =>
									handleDeleteCategory(category.id)
								}
								isLoading={isLoading}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default CategoryTable;
