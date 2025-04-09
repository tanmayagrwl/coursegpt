"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
	Plus,
	Wand2,
	FileText,
	CheckSquare,
	Beaker,
	GripVertical,
	Edit,
	Trash2,
	ImageIcon,
	Video,
	FileIcon,
	Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddLessonDialog from "@/components/add-lesson-dialog";
import MediaUploadDialog from "@/components/media-upload-dialog";
import MediaBadge from "@/components/media-badge";
import axios from "axios";

interface Lesson {
	id: string;
	content: string;
	type: string;
	title: string;
	learningOutcomes: string[];
	additionalResources: {
		title: string;
		url: string;
		type: string;
	}[];
}

interface Module {
	id: string;
	title: string;
	description: string;
	lessons: Lesson[];
}

interface ModuleEditorProps {
	module: Module;
	courseId: string;
	onLessonDeleted: () => void;
}

export default function ModuleEditor({
	module,
	courseId,
	onLessonDeleted,
}: ModuleEditorProps) {
	console.log("ModuleEditor props:", module, courseId);
	const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
	const [isGeneratingContent, setIsGeneratingContent] = useState(false);
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
	const [timedContent, setTimedContent] = useState("");
	const [timedLearningOutcomes, setTimedLearningOutcomes] = useState<string[]>(
		[],
	);
	const [isgeneratingOutcomes, setIsGeneratingOutcomes] = useState(false);
	console.log("Module", module);
	console.log("Selected lesson:", selectedLesson);
	const [mediaBadges, setMediaBadges] = useState([]);
	console.log("Set selected lesson:", setSelectedLesson);

	const handleGenerateOutcomes = async (
		title: string,
	): Promise<{ outcomes: string[] }> => {
		setTimedLearningOutcomes(selectedLesson?.learningOutcomes || []);
		console.log("Timed learning outcomes:", timedLearningOutcomes);
		console.log("Generating outcomes for lesson:", title);
		setIsGeneratingOutcomes(true);
		try {
			// Input validation
			if (!title || typeof title !== "string" || title.trim() === "") {
				throw new Error("A valid lesson title is required");
			}
			console.log("Making API call to generate outcomes...", title);
			const response = await axios.post("/api/generateOutcomes", { title });

			// Check for successful response
			if (response.status !== 200) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			// Check if the response has the expected format
			if (!response.data) {
				throw new Error("API returned unexpected data format");
			}

			console.log("Generated outcomes:", response.data);

			if (selectedLesson) {
				setSelectedLesson({
					...selectedLesson,
					learningOutcomes: response.data,
				});
			}
			return response.data;
		} catch (error) {
			console.error("Error generating outcomes:", error);
			if (axios.isAxiosError(error)) {
				if (error.response) {
					throw new Error(
						`Failed to generate outcomes: ${error.response.data?.message || error.message}`,
					);
				}
			}
			throw new Error(
				`Failed to generate outcomes: ${(error as Error).message}`,
			);
		} finally {
			setIsGeneratingOutcomes(false);
		}
	};

	const handleGenerateContent = async (
		title: string,
	): Promise<{ content: string }> => {
		setTimedContent(selectedLesson?.content || "");
		console.log("Generating content for lesson:", title);
		setIsGeneratingContent(true);
		try {
			// Input validation
			if (!title || typeof title !== "string" || title.trim() === "") {
				throw new Error("A valid lesson title is required");
			}

			// Make the API call
			const response = await axios.post("/api/generateContent", { title });

			// Check for successful response
			if (response.status !== 200) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			// Check if the response has the expected format
			if (!response.data || !response.data.content) {
				throw new Error("API returned unexpected data format");
			}

			console.log("Generated content:", response.data.content);

			if (selectedLesson) {
				setSelectedLesson({
					...selectedLesson,
					content: response.data.content,
				});
			}
			return response.data;
		} catch (error) {
			// Log the error for debugging
			console.error("Error generating content:", error);

			// Re-throw with a user-friendly message
			if (axios.isAxiosError(error)) {
				if (error.response) {
					throw new Error(
						`Failed to generate content: ${error.response.data?.message || error.message}`,
					);
				}
			}
			// For other types of errors
			throw new Error(
				`Failed to generate content: ${(error as Error).message}`,
			);
		} finally {
			setIsGeneratingContent(false);
		}
	};

	const handleContentCancelButton = () => {
		if (selectedLesson) {
			setSelectedLesson({
				...selectedLesson,
				content: timedContent,
			});
		}
	};

	const handleDeleteLesson = async (lessonId: string) => {
		if (!courseId || !module.id || !lessonId) {
			console.error("Missing required parameters for deleting a lesson.");
			return;
		}

		try {
			const response = await axios.post(
				`http://localhost:3000/api/deleteLesson/${courseId}/${module.id}/${lessonId}`,
			);
			console.log("Lesson deleted successfully:", response.data);
			onLessonDeleted();
			setSelectedLesson(null);
		} catch (error) {
			console.error("Error deleting lesson:", error);
		}
	};

	const handleUpdateLesson = async (updatedLesson: Lesson) => {
		if (!courseId || !module.id || !selectedLesson?.id) {
			console.error("Missing required parameters for updating a lesson.");
			return;
		}

		try {
			const response = await axios.post(
				`http://localhost:3000/api/updateLesson/${courseId}/${module.id}/${selectedLesson.id}`,
				updatedLesson,
			);
			console.log("Lesson updated successfully:", response.data);
			onLessonDeleted(); // Refresh the course data
			setSelectedLesson(
				response.data.course.modules
					.find((m) => m.id === module.id)
					?.lessons.find((l) => l.id === selectedLesson.id) || null,
			);
		} catch (error) {
			console.error("Error updating lesson:", error);
		}
	};

	const handleSaveLessonContent = () => {
		if (selectedLesson) {
			const updatedLesson = {
				...selectedLesson,
				content: selectedLesson.content, // Update content
			};
			handleUpdateLesson(updatedLesson);
			setTimedContent("");
		}
	};

	const handleSaveLearningOutcomes = (updatedOutcomes: string[]) => {
		if (selectedLesson) {
			const updatedLesson = {
				...selectedLesson,
				learningOutcomes: updatedOutcomes, // Update learning outcomes
			};
			handleUpdateLesson(updatedLesson);
			setTimedLearningOutcomes([]);
		}
	};

	const getLessonIcon = (type) => {
		switch (type) {
			case "lecture":
				return <FileText className="h-4 w-4 text-blue-500" />;
			case "quiz":
				return <CheckSquare className="h-4 w-4 text-purple-500" />;
			case "lab":
				return <Beaker className="h-4 w-4 text-amber-500" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	const getLessonTypeBadge = (type) => {
		switch (type) {
			case "lecture":
				return (
					<span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
						Lecture
					</span>
				);
			case "quiz":
				return (
					<span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
						Quiz
					</span>
				);
			case "lab":
				return (
					<span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
						Lab
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="pt-6">
					<div className="flex justify-between items-start mb-4">
						<div>
							<h3 className="text-lg font-medium">{module.title}</h3>
							<p className="text-gray-500">{module.description}</p>
						</div>
					</div>

					<div className="flex justify-between items-center mb-4 mt-6">
						<h4 className="font-medium">Lessons</h4>
						<div className="flex gap-2">
							<AddLessonDialog
								courseId={courseId}
								moduleId={module.id}
								onLessonDeleted={onLessonDeleted}
								trigger={
									<Button size="sm" variant="outline">
										<Plus className="h-4 w-4 mr-2" />
										Add Lesson
									</Button>
								}
							/>

							<Button size="sm" variant="outline">
								<Wand2 className="h-4 w-4 mr-2" />
								Generate All
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						{module.lessons.map((lesson) => (
							<div
								key={lesson.id}
								className={`border rounded-md p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
									selectedLesson?.id === lesson.id
										? "border-emerald-500 bg-emerald-50"
										: ""
								}`}
								onClick={() =>
									setSelectedLesson(
										selectedLesson?.id === lesson.id ? null : lesson,
									)
								}
							>
								<div className="text-gray-400 cursor-grab">
									<GripVertical className="h-5 w-5" />
								</div>
								{getLessonIcon(lesson.type)}
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="font-medium">{lesson.title}</span>
										{getLessonTypeBadge(lesson.type)}
									</div>
								</div>
								<div className="flex gap-1">
									<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
										<Edit className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 p-0 text-red-500"
										onClick={() => handleDeleteLesson(lesson.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{selectedLesson && (
				<Card>
					<CardContent className="pt-6">
						<h3 className="text-lg font-medium mb-4">Lesson Content Editor</h3>

						<Tabs defaultValue="content" className="w-full">
							<TabsList className="mb-4">
								<TabsTrigger value="content">Content</TabsTrigger>
								<TabsTrigger value="learning-outcomes">
									Learning Outcomes
								</TabsTrigger>
							</TabsList>

							<TabsContent value="content" className="space-y-4">
								<div className="flex justify-between items-center mb-2">
									<Label>Lesson Content</Label>
									<Button
										variant="outline"
										disabled={isGeneratingContent}
										size="sm"
										onClick={() => handleGenerateContent(selectedLesson.title)}
									>
										<Wand2 className="h-3 w-3 mr-2" />
										{isGeneratingContent ? (
											<Loader2 className="animate-spin" />
										) : (
											"Enhance with AI"
										)}
									</Button>
								</div>
								<div className="flex gap-2 mb-2">
									<MediaUploadDialog
										type="image"
										trigger={
											<Button
												variant="outline"
												size="sm"
												className="flex items-center gap-1"
											>
												<ImageIcon className="h-4 w-4" />
												<span>Add Image</span>
											</Button>
										}
										onUpload={(media) => {
											console.log("Image added:", media);
											setMediaBadges([...mediaBadges, media]);
											// Here you would typically insert the image into the editor
										}}
									/>
									<MediaUploadDialog
										type="video"
										trigger={
											<Button
												variant="outline"
												size="sm"
												className="flex items-center gap-1"
											>
												<Video className="h-4 w-4" />
												<span>Add Video</span>
											</Button>
										}
										onUpload={(media) => {
											console.log("Video added:", media);
											setMediaBadges([...mediaBadges, media]);
											// Here you would typically insert the video into the editor
										}}
									/>
									<MediaUploadDialog
										type="file"
										trigger={
											<Button
												variant="outline"
												size="sm"
												className="flex items-center gap-1"
											>
												<FileIcon className="h-4 w-4" />
												<span>Add File</span>
											</Button>
										}
										onUpload={(media) => {
											console.log("File added:", media);
											setMediaBadges([...mediaBadges, media]);
											// Here you would typically insert a link to the file into the editor
										}}
									/>
								</div>

								{mediaBadges.length > 0 && (
									<div className="flex flex-wrap gap-2 mb-3 p-2 border rounded-md bg-gray-50">
										<div className="text-xs font-medium text-gray-500 mr-2 flex items-center">
											Inserted Media:
										</div>
										{mediaBadges.map((media) => (
											<MediaBadge
												key={media.id}
												media={media}
												onRemove={(id) => {
													setMediaBadges(
														mediaBadges.filter((m) => m.id !== id),
													);
												}}
												onInsert={(media) => {
													// Here you would typically focus the editor and insert the media
													console.log("Insert media:", media.insertText);
												}}
											/>
										))}
									</div>
								)}

								<Textarea
									placeholder="Enter lesson content here..."
									rows={12}
									disabled={isGeneratingContent}
									className="font-mono text-sm"
									value={selectedLesson.content}
									onChange={(e) =>
										setSelectedLesson({
											...selectedLesson,
											content: e.target.value,
										})
									}
								/>

								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										disabled={timedContent === ""}
										onClick={handleContentCancelButton}
									>
										Cancel
									</Button>
									<Button onClick={handleSaveLessonContent}>
										Save Changes
									</Button>
								</div>
							</TabsContent>

							<TabsContent value="learning-outcomes" className="space-y-4">
								<div className="flex justify-between items-center mb-2">
									<Label>Learning Outcomes</Label>
									<Button
										variant="outline"
										size="sm"
										disabled={isgeneratingOutcomes}
										onClick={() => handleGenerateOutcomes(selectedLesson.title)}
									>
										<Wand2 className="h-3 w-3 mr-2" />
										{isgeneratingOutcomes ? (
											<Loader2 className="animate-spin" />
										) : (
											"Generate Outcomes"
										)}
									</Button>
								</div>

								<div className="space-y-2">
									{selectedLesson?.learningOutcomes?.map((outcome, index) => (
										<div
											key={index}
											className="flex items-center gap-2 p-3 border rounded-md"
										>
											<Input
												defaultValue={outcome}
												className="flex-1"
												onChange={(e) => {
													const updatedOutcomes = [
														...selectedLesson.learningOutcomes,
													];
													updatedOutcomes[index] = e.target.value;
													setSelectedLesson({
														...selectedLesson,
														learningOutcomes: updatedOutcomes,
													});
												}}
											/>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0"
												onClick={() => {
													const updatedOutcomes =
														selectedLesson.learningOutcomes.filter(
															(_, i) => i !== index,
														);
													setSelectedLesson({
														...selectedLesson,
														learningOutcomes: updatedOutcomes,
													});
												}}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>

								<div className="mt-2 space-y-2">
									<div className="flex items-center gap-2">
										<Input
											placeholder="Enter new learning outcome..."
											className="flex-1 learning-outcome-input"
											onKeyDown={(e) => {
												if (e.key === "Enter" && e.currentTarget.value.trim()) {
													setSelectedLesson({
														...selectedLesson,
														learningOutcomes: [
															...selectedLesson.learningOutcomes,
															e.currentTarget.value.trim(),
														],
													});
													e.currentTarget.value = "";
												}
											}}
										/>
										<Button
											size="sm"
											onClick={() => {
												const input = document.querySelector<HTMLInputElement>(
													".learning-outcome-input",
												);
												if (input?.value.trim()) {
													setSelectedLesson({
														...selectedLesson,
														learningOutcomes: [
															...selectedLesson.learningOutcomes,
															input.value.trim(),
														],
													});
													input.value = "";
												}
											}}
										>
											Add
										</Button>
									</div>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										disabled={timedLearningOutcomes.length === 0}
										onClick={() => {
											setSelectedLesson({
												...selectedLesson,
												learningOutcomes: timedLearningOutcomes,
											});
										}}
									>
										Cancel
									</Button>
									<Button
										onClick={() =>
											handleSaveLearningOutcomes(
												selectedLesson.learningOutcomes,
											)
										}
									>
										Save Changes
									</Button>
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
