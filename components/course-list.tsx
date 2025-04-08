import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Book, Clock, Users } from "lucide-react"
import type { Course } from "@/types/types"

const courses: Course[] = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    description: "Learn the fundamentals of machine learning algorithms and applications",
    modules: 8,
    lessons: 24,
    duration: "6 hours",
    students: 128,
    image: "/placeholder.svg?height=200&width=400",
    status: "published",
  },
  {
    id: "2",
    title: "Web Development Bootcamp",
    description: "Master HTML, CSS, and JavaScript to build modern web applications",
    modules: 12,
    lessons: 48,
    duration: "12 hours",
    students: 256,
    image: "/placeholder.svg?height=200&width=400",
    status: "draft",
  },
  {
    id: "3",
    title: "Data Science Fundamentals",
    description: "Explore data analysis, visualization, and statistical methods",
    modules: 10,
    lessons: 32,
    duration: "8 hours",
    students: 96,
    image: "/placeholder.svg?height=200&width=400",
    status: "published",
  },
]

export default function CourseList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Link href={`/courses/${course.id}`} key={course.id}>
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <div className="relative">
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Badge
                className={`absolute top-3 right-3 ${
                  course.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              >
                {course.status === "published" ? "Published" : "Draft"}
              </Badge>
            </div>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Book className="h-4 w-4" />
                  <span>{course.modules} modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 text-sm text-gray-500">Last updated: 2 days ago</CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
