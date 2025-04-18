"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Plus,
	Trash2,
	MoveUp,
	MoveDown,
	Edit,
	Wand2,
	MoreHorizontal,
} from "lucide-react";
import ModuleEditor from "@/components/module-editor";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddModuleDialog from "@/components/add-module-dialog";
import type { Course, Module } from "@/types/types";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface ApiLesson {
	_id: string;
	title: string;
	type: string;
	difficultyLevel?: string;
	content: string;
	learningOutcomes?: string[];
}

interface ApiModule {
	_id: string;
	title: string;
	description: string;
	lessons: ApiLesson[];
}

interface ApiCourse {
	_id: string;
	title: string;
	description: string;
	status: string;
	modules: ApiModule[];
}

const fetchCourse = async (courseId: string) => {
	const response = await fetch(`/api/getCourse/${courseId}`);
	const data: ApiCourse = await response.json();

	if (!data) {
		return null;
	}

	const mappedCourse: Course = {
		id: data._id,
		title: data.title,
		description: data.description,
		status:
			data.status === "Draft" || data.status === "Published"
				? data.status
				: "Draft",
		modules: data.modules.map((module: ApiModule) => ({
			id: module._id,
			title: module.title,
			description: module.description,
			lessons: module.lessons.map((lesson: ApiLesson) => ({
				id: lesson._id,
				title: lesson.title,
				type: lesson.type,
				difficultyLevel: lesson.difficultyLevel || "Beginner",
				content: lesson.content,
				learningOutcomes: lesson.learningOutcomes || [],
			})),
		})),
	};

	return mappedCourse;
};

export default function CourseDetail() {
	const { courseId } = useParams<{ courseId: string }>();
	const [activeTab, setActiveTab] = useState("modules");
	const [activeModule, setActiveModule] = useState<string | null>(null);
	const [course, setCourse] = useState<Course | null>(null);

	useEffect(() => {
		fetchCourse(courseId).then((data) => {
			setCourse(data);
		});
	}, [courseId]);


	const handleRefresh = () => {
		fetchCourse(courseId).then((data) => {
			setCourse(data);
		});
	};

	const toggleCourseStatus = async () => {
		if (!course) return;

		try {
			const response = await fetch(`/api/togglePublish/${course.id}`, {
				method: "POST",
			});
			if (!response.ok) {
				throw new Error(
					`Failed to toggle course status: ${response.statusText}`,
				);
			}

			const data = await response.json();

			if (data) {
				setCourse((prevCourse) => {
					if (!prevCourse) return null;
					return {
						...prevCourse,
						status: prevCourse.status === "Draft" ? "Published" : "Draft",
					};
				});
			}
		} catch (error) {
			console.error("Error toggling course status:", error);
		}
	};

	const handleModuleDelete = async (moduleId: string) => {
		if (!course) return;

		try {
			const response = await fetch(
				`/api/deleteModule/${course.id}/${moduleId}`,
				{
					method: "POST", 
				},
			);

			if (!response.ok) {
				throw new Error(`Failed to delete module: ${response.statusText}`);
			}


			setCourse((prevCourse) => {
				if (!prevCourse) return null;
				return {
					...prevCourse,
					modules: prevCourse.modules.filter(
						(module) => module.id !== moduleId,
					),
				};
			});


			if (activeModule === moduleId) {
				setActiveModule(null);
			}
		} catch (error) {
			console.error("Error deleting module:", error);

			alert("Failed to delete module. Please try again.");
			fetchCourse(courseId).then((data) => {
				setCourse(data);
			});
		}
	};

	const handleModuleClick = (moduleId: string) => {
		setActiveModule(moduleId === activeModule ? null : moduleId);
	};

	const handleUpdateBanner = async () => {
		if (!course) return;
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = "image/*";
		fileInput.onchange = async (e) => {
			const target = e.target as HTMLInputElement;
			const file = target.files?.[0];
			
			if (!file) return;
			
			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64String = reader.result as string;
				
				try {
					const response = await fetch(`/api/updateCourse/${courseId}`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							thumbnail: base64String
						}),
					});
					
					if (!response.ok) {
						throw new Error(`Failed to update banner: ${response.statusText}`);
					}
					
					handleRefresh();
					toast.success("Banner updated successfully!");
				} catch (error) {
					console.error("Error updating banner:", error);
					alert("Failed to update banner. Please try again.");
				}
			};
			
			reader.readAsDataURL(file);
		};
		
		fileInput.click();
	};

	if (!course) {
		return <div className="absolute top-1/2 left-1/2">Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Link href="/" className="flex items-center gap-2 py-1">
							<ArrowLeft className="h-4 w-4" />
							<span>Back to Dashboard</span>
						</Link>
						
					</div>
					<Button onClick={handleUpdateBanner}>Update Banner</Button>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<h1 className="text-2xl font-bold">{course.title}</h1>
							<Badge>{course.status || "Draft"}</Badge>
						</div>
						<p className="text-gray-600">{course.description}</p>
					</div>
					<Button
						className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700"
						onClick={toggleCourseStatus}
					>
						{course.status === "Published" ? "Draft Course" : "Publish Course"}
					</Button>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsContent value="modules">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-1">
								<Card>
									<CardContent className="pt-6">
										<div className="flex justify-between items-center mb-4">
											<h3 className="font-medium">Course Modules</h3>
											<AddModuleDialog
												courseTitle={course.title}
												courseId={course.id}
												handleRefresh={handleRefresh}
												trigger={
													<Button size="sm">
														<Plus className="h-4 w-4 mr-2" />
														Add Module
													</Button>
												}
											/>
										</div>

										<div className="space-y-3">
											{course.modules.map((module) => (
												<div
													key={module.id}
													className={`border rounded-md p-3 cursor-pointer transition-colors ${
														activeModule === module.id
															? "border-emerald-500 bg-emerald-50"
															: "hover:bg-gray-50"
													}`}
													onClick={() => handleModuleClick(module.id)}
													onKeyUp={(event) => {
														if (event.key === "Enter" || event.key === " ") {
															handleModuleClick(module.id);
														}
													}}
												>
													<div className="flex justify-between items-start">
														<div>
															<h4 className="font-medium">{module.title}</h4>
															<p className="text-sm text-gray-500">
																{module.lessons.length} lessons
															</p>
														</div>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-8 w-8 p-0"
																>
																	<MoreHorizontal className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	className="text-red-600"
																	onClick={() => handleModuleDelete(module.id)}
																>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="lg:col-span-2">
								{activeModule ? (
									<ModuleEditor
										courseId={courseId}
										module={course.modules.find((m) => m.id === activeModule)}
										onLessonDeleted={handleRefresh}
									/>
								) : (
									<Card>
										<CardContent className="py-12 flex flex-col items-center justify-center text-center">
											<div className="bg-gray-100 p-4 rounded-full mb-4">
												<Wand2 className="h-8 w-8 text-emerald-600" />
											</div>
											<h3 className="text-xl font-medium mb-2">
												Select a module or create a new one
											</h3>
											<p className="text-gray-500 mb-6 max-w-md">
												Select a module from the list or create a new one to
												start building your course content
											</p>
											<AddModuleDialog
											courseTitle={course.title}
												courseId={course.id}
												handleRefresh={handleRefresh}
												trigger={
													<Button>
														<Plus className="h-4 w-4 mr-2" />
														Create New Module
													</Button>
												}
											/>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
