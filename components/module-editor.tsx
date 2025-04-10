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
import ReactMarkdown from "react-markdown";

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
	const [isGeneratingContent, setIsGeneratingContent] = useState(false);
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
	const [timedContent, setTimedContent] = useState("");
	const [timedLearningOutcomes, setTimedLearningOutcomes] = useState<string[]>(
		[],
	);
	const [isGeneratingOutcomes, setIsGeneratingOutcomes] = useState(false);
	const [mediaBadges, setMediaBadges] = useState([]);
	const [showPreview, setShowPreview] = useState(true);

	const handleGenerateOutcomes = async (
		title: string,
	): Promise<{ outcomes: string[] }> => {
		setTimedLearningOutcomes(selectedLesson?.learningOutcomes || []);
		setIsGeneratingOutcomes(true);
		try {
			if (!title || typeof title !== "string" || title.trim() === "") {
				throw new Error("A valid lesson title is required");
			}
			const response = await axios.post("/api/generateOutcomes", { title });

			if (response.status !== 200) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			if (!response.data) {
				throw new Error("API returned unexpected data format");
			}

			if (selectedLesson) {
				setSelectedLesson({
					...selectedLesson,
					learningOutcomes: response.data,
				});
			}
			return response.data;
		} catch (error) {
			console.error("Error generating outcomes:", error);
			throw error;
		} finally {
			setIsGeneratingOutcomes(false);
		}
	};

	const handleGenerateContent = async (
		title: string,
	): Promise<{ content: string }> => {
		setTimedContent(selectedLesson?.content || "");
		setIsGeneratingContent(true);
		try {
			if (!title || typeof title !== "string" || title.trim() === "") {
				throw new Error("A valid lesson title is required");
			}

			const response = await axios.post("/api/generateContent", { title });

			if (response.status !== 200) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			if (!response.data?.content) {
				throw new Error("API returned unexpected data format");
			}

			if (selectedLesson) {
				setSelectedLesson({
					...selectedLesson,
					content: response.data.content,
				});
			}
			return response.data;
		} catch (error) {
			console.error("Error generating content:", error);
			throw error;
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
		if (!courseId || !module.id || !lessonId) return;

		try {
			await axios.post(
				`/api/deleteLesson/${courseId}/${module.id}/${lessonId}`,
			);
			onLessonDeleted();
			setSelectedLesson(null);
		} catch (error) {
			console.error("Error deleting lesson:", error);
		}
	};

	const handleUpdateLesson = async (updatedLesson: Lesson) => {
		if (!courseId || !module.id || !selectedLesson?.id) return;

		try {
			const response = await axios.post(
				`/api/updateLesson/${courseId}/${module.id}/${selectedLesson.id}`,
				updatedLesson,
			);
			onLessonDeleted();
			setSelectedLesson(
				response.data.course.modules
					.find((m: Module) => m.id === module.id)
					?.lessons.find((l: Lesson) => l.id === selectedLesson.id) || null,
			);
		} catch (error) {
			console.error("Error updating lesson:", error);
		}
	};

	const handleSaveLessonContent = () => {
		if (selectedLesson) {
			handleUpdateLesson({
				...selectedLesson,
				content: selectedLesson.content,
			});
			setTimedContent("");
		}
	};

	const handleSaveLearningOutcomes = (updatedOutcomes: string[]) => {
		if (selectedLesson) {
			handleUpdateLesson({
				...selectedLesson,
				learningOutcomes: updatedOutcomes,
			});
			setTimedLearningOutcomes([]);
		}
	};

	const getLessonIcon = (type: string) => {
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

	const getLessonTypeBadge = (type: string) => {
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
						</div>
					</div>

					<div className="space-y-2">
						{module.lessons.map((lesson) => (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
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
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteLesson(lesson.id);
										}}
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
									<div className="flex gap-2">
										<Button
											variant={showPreview ? "default" : "outline"}
											size="sm"
											onClick={() => setShowPreview(!showPreview)}
										>
											{showPreview ? "Hide Preview" : "Show Preview"}
										</Button>
										<Button
											variant="outline"
											disabled={isGeneratingContent}
											size="sm"
											onClick={() =>
												handleGenerateContent(selectedLesson.title)
											}
										>
											<Wand2 className="h-3 w-3 mr-2" />
											{isGeneratingContent ? (
												<Loader2 className="animate-spin" />
											) : (
												"Enhance with AI"
											)}
										</Button>
									</div>
								</div>

								<div className="flex flex-col lg:flex-row  gap-4 mmin-h-[400px]">
									<Textarea
										placeholder="Enter markdown content here..."
										value={selectedLesson.content}
										onChange={(e) =>
											setSelectedLesson({
												...selectedLesson,
												content: e.target.value,
											})
										}
										className={`font-mono text-sm h-full min-h-[400px] resize-none ${
											showPreview ? "w-1/2" : "w-full"
										}`}
										disabled={isGeneratingContent}
									/>

									{showPreview && (
										<div className="w-1/2 h-full max-h-[400px] overflow-y-auto p-4 border rounded-md bg-gray-50">
											<ReactMarkdown>
												{selectedLesson.content || "*Nothing to preview*"}
											</ReactMarkdown>
										</div>
									)}
								</div>

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
										disabled={isGeneratingOutcomes}
										onClick={() => handleGenerateOutcomes(selectedLesson.title)}
									>
										<Wand2 className="h-3 w-3 mr-2" />
										{isGeneratingOutcomes ? (
											<Loader2 className="animate-spin" />
										) : (
											"Generate Outcomes"
										)}
									</Button>
								</div>

								<div className="space-y-2">
									{selectedLesson.learningOutcomes.map((outcome, index) => (
										<div
											key={outcome}
											className="flex items-center gap-2 p-3 border rounded-md"
										>
											<Input
												value={outcome}
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
											className="flex-1"
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
											onClick={(e) => {
												const input = e.currentTarget
													.previousElementSibling as HTMLInputElement;
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
