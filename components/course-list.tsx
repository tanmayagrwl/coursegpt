import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Loader2 } from "lucide-react";
import type { Course } from "@/types/types";
interface CourseListProps {
  courses: Course[];
}

export default function CourseList({ courses }: CourseListProps) {
	if (courses.length === 0) {
		return <div className="absolute left-1/2 pt-20"><Loader2 className="animate-spin" /></div>
	}
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{courses.map((course: Course) => (
				<Link href={`/courses/${course._id}`} key={course._id}>
					<Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
						<div className="relative">
							<img
								src={course.thumbnail || "/placeholder.svg"}
								alt={course.title}
								className="w-full h-48 object-cover rounded-t-lg"
							/>
							<Badge
								className={`absolute top-3 right-3 ${
									course.status === "Published"
										? "bg-emerald-500"
										: "bg-amber-500"
								}`}
							>
								{course.status === "Published" ? "Published" : "Draft"}
							</Badge>
						</div>
						<CardContent className="pt-6">
							<h3 className="text-lg font-semibold mb-2 line-clamp-1">
								{course.title}
							</h3>
							<p className="text-gray-600 text-sm mb-4 line-clamp-2">
								{course.description}
							</p>
							<div className="flex flex-wrap gap-4 text-sm text-gray-500">
								<div className="flex items-center gap-1">
									<Book className="h-4 w-4" />
									<span>{course.modules.length} modules</span>
								</div>
							</div>
						</CardContent>
						<CardFooter className="border-t pt-4 text-sm text-gray-500">
							Last updated:{" "}
							{new Date(course.updatedAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</CardFooter>
					</Card>
				</Link>
			))}
		</div>
	);
}
