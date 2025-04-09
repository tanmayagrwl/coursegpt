"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	PlusCircle,
	BookOpen,
	Layers,
	Edit3,
	Zap,
	Loader2,
} from "lucide-react";
import CourseList from "@/components/course-list";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { Course } from "@/types/types";
export default function Dashboard() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [courses, setCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/api/getAllCourses`);
			setCourses(response.data);
		} catch (error) {
			console.error("Error fetching courses:", error);
		}
	};

	useEffect( () => {
    const fetchCourses = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/api/getAllCourses`);
			setCourses(response.data);
		} catch (error) {
			console.error("Error fetching courses:", error);
		}
	};
		fetchCourses();
	}, []);

	const handleCreateCourse = async () => {
		if (!prompt) {
			router.push("courses/new");
			return;
		}
		const finalPrompt = title
			? `Keep the title of the course as ${title} dont add anything before or after this. It should be ${title} and nothing except that and generate the course around ${prompt}`
			: prompt;
		try {
			setIsGenerating(true);
			await axios.post(`${BASE_URL}/api/generate`, {
				text: finalPrompt,
			});
			setIsGenerating(false);
			await fetchCourses();

			// console.log("Response from AI:", response)
		} catch (error) {
			console.error("Error creating course:", error);
		} finally {
			setIsGenerating(false);
			setDialogOpen(false);
		}
	};

	// Reset form function
	const resetForm = () => {
		setTitle("");
		setPrompt("");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<BookOpen className="h-6 w-6 text-emerald-600" />
						<h1 className="text-xl font-bold text-gray-900">CourseGPT</h1>
					</div>
					<div className="flex items-center gap-4" />
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							Welcome to CourseGPT
						</h2>
						<p className="text-gray-600 mt-1">
							Create and manage AI-powered courses with ease
						</p>
					</div>
					<Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
						<DialogTrigger asChild>
							<Button className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700">
								<PlusCircle className="h-4 w-4 mr-2" />
								Create New Course
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[600px]">
							<DialogHeader>
								<DialogTitle>Create New Course</DialogTitle>
								<DialogDescription>
									Use AI to generate your course structure or create manually.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="course-name-main">Course Name</Label>
									<Input
										id="course-name-main"
										placeholder="Enter course name"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
									/>
								</div>
								<div className="space-y-2" />
								<div className="space-y-2">
									<Label htmlFor="ai-prompt-main">
										AI Generation Prompt (Optional)
									</Label>
									<Textarea
										id="ai-prompt-main"
										placeholder="Describe your course and the AI will generate a structure for you..."
										rows={3}
										value={prompt}
										onChange={(e) => setPrompt(e.target.value)}
									/>
									{isGenerating && (
										<p className="pt-1 text-sm text-gray-600">
											Please wait while we generate your course...
										</p>
									)}
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										resetForm;
										setDialogOpen(false);
									}}
								>
									Cancel
								</Button>
								<Button onClick={handleCreateCourse} disabled={isGenerating}>
									{isGenerating ? (
										<Loader2 className="animate-spin" />
									) : (
										"continue"
									)}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<FeatureCard
						icon={<Zap className="h-8 w-8 text-emerald-600" />}
						title="AI Lesson Generator"
						description="Create structured lessons with compelling content in seconds"
					/>
					<FeatureCard
						icon={<Layers className="h-8 w-8 text-emerald-600" />}
						title="Module Organization"
						description="Organize lessons into cohesive modules with intelligent sequencing"
					/>
					<FeatureCard
						icon={<Edit3 className="h-8 w-8 text-emerald-600" />}
						title="Interactive Editor"
						description="Edit and refine AI-generated content with powerful tools"
					/>
				</div>

				<div className="mb-6 flex justify-between items-center">
					<h3 className="text-xl font-semibold text-gray-900">Your Courses</h3>
				</div>

				<CourseList courses={courses} />
			</main>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: { icon: React.ReactNode; title: string; description: string }) {
	return (
		<div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
			<div className="mb-4">{icon}</div>
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-gray-600">{description}</p>
		</div>
	);
}
