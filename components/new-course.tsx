"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Save, Wand2, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

export default function NewCourse() {
	const searchParams = useSearchParams();
	const search = searchParams.get("title");

	const router = useRouter();
	const [courseTitle, setCourseTitle] = useState("");
	const [courseDescription, setCourseDescription] = useState("");
	const [category, setCategory] = useState("");
	const [difficultyLevel, setDifficultyLevel] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (search) {
			setCourseTitle(search);
		}
	}, [search]);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.match("image.*")) {
			setError("Please select an image file");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			// 5MB limit
			setError("Image size should be less than 5MB");
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			if (event.target?.result) {
				setThumbnail(event.target.result as string);
			}
		};
		reader.readAsDataURL(file);
	};

	const handleGenerateThumbnail = async () => {
		if (!courseTitle) {
			setError("Please enter a course title first");
			return;
		}

		setIsGeneratingThumbnail(true);
		setError("");

		try {
			// This is a mock implementation - replace with actual AI generation API call
			// For demo purposes, we'll just create a placeholder image with the title
			const canvas = document.createElement("canvas");
			canvas.width = 800;
			canvas.height = 450;
			const ctx = canvas.getContext("2d");

			if (ctx) {
				// Create gradient background
				const gradient = ctx.createLinearGradient(
					0,
					0,
					canvas.width,
					canvas.height,
				);
				gradient.addColorStop(0, "#4f46e5");
				gradient.addColorStop(1, "#06b6d4");
				ctx.fillStyle = gradient;
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				// Add text
				ctx.fillStyle = "white";
				ctx.font = "bold 48px sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(courseTitle, canvas.width / 2, canvas.height / 2);

				// Convert to base64
				setThumbnail(canvas.toDataURL("image/jpeg"));
			}
		} catch (err) {
			console.error("Error generating thumbnail:", err);
			setError("Failed to generate thumbnail");
		} finally {
			setIsGeneratingThumbnail(false);
		}
	};

	const handleCreateCourse = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!courseTitle || !category || !difficultyLevel) {
			setError("Title, category, and difficulty level are required");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/createCourse", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: courseTitle,
					description: courseDescription,
					category,
					difficultyLevel,
					status: "Draft",
					thumbnail, // Include the base64 image
					modules: [],
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to create course");
			}

			const { course } = await response.json();
			router.push(`/courses/${course._id}`);
		} catch (err) {
			console.error("Error creating course:", err);
			setError(err.message || "An error occurred while creating the course");
		} finally {
			setIsSubmitting(false);
		}
	};

	const removeThumbnail = () => {
		setThumbnail(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Link href="/" className="flex items-center gap-2">
							<ArrowLeft className="h-4 w-4" />
							<span>Back to Dashboard</span>
						</Link>
					</div>
					<Button
						onClick={handleCreateCourse}
						disabled={!courseTitle || isSubmitting}
					>
						<Save className="h-4 w-4 mr-2" />
						{isSubmitting ? "Creating..." : "Create Course"}
					</Button>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold mb-6">Create New Course</h1>

				{error && (
					<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}

				<Tabs defaultValue="details" className="w-full">
					<TabsContent value="details">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<div className="lg:col-span-2">
								<Card>
									<CardContent className="pt-6">
										<form className="space-y-6">
											<div className="space-y-2">
												<Label htmlFor="title">Course Title*</Label>
												<Input
													id="title"
													placeholder="e.g., Introduction to Data Science"
													value={courseTitle}
													onChange={(e) => setCourseTitle(e.target.value)}
													required
												/>
											</div>

											<div className="space-y-2">
												<div className="flex justify-between items-center">
													<Label htmlFor="description">
														Course Description
													</Label>
												</div>
												<Textarea
													id="description"
													placeholder="Describe what students will learn in this course..."
													rows={5}
													value={courseDescription}
													onChange={(e) => setCourseDescription(e.target.value)}
												/>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="category">Category*</Label>
													<Input
														id="category"
														placeholder="e.g., Programming"
														value={category}
														onChange={(e) => setCategory(e.target.value)}
														required
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="level">Difficulty Level*</Label>
													<Select
														value={difficultyLevel}
														onValueChange={setDifficultyLevel}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select difficulty level" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="Beginner">Beginner</SelectItem>
															<SelectItem value="Intermediate">
																Intermediate
															</SelectItem>
															<SelectItem value="Advanced">Advanced</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										</form>
									</CardContent>
								</Card>
							</div>

							<div>
								<Card>
									<CardContent className="pt-6">
										<h3 className="text-lg font-medium mb-4">Course Preview</h3>
										{thumbnail ? (
											<div className="relative aspect-video mb-4">
												<img
													src={thumbnail}
													alt="Course thumbnail"
													className="w-full h-full object-cover rounded-md"
												/>
												<button
													type="button"
													onClick={removeThumbnail}
													className="absolute top-2 right-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-full p-1"
													title="Remove thumbnail"
													aria-label="Remove thumbnail"
												>
													<X className="h-4 w-4 text-white" />
												</button>
											</div>
										) : (
											<div className="aspect-video bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500">
												Course Thumbnail
											</div>
										)}
										<p className="text-sm text-gray-500 mb-4">
											Upload a course thumbnail or generate one with AI
										</p>
										<div className="flex gap-2">
											<input
												title="Upload thumbnail"
												type="file"
												ref={fileInputRef}
												accept="image/*"
												onChange={handleImageUpload}
												className="hidden"
												id="thumbnail-upload"
											/>
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
												onClick={() => fileInputRef.current?.click()}
											>
												<ImagePlus className="h-3 w-3 mr-1" />
												Upload
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
												onClick={handleGenerateThumbnail}
												disabled={isGeneratingThumbnail}
											>
												<Wand2 className="h-3 w-3 mr-1" />
												{isGeneratingThumbnail ? "Generating..." : "Generate"}
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
