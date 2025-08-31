"use client"
import { useState } from "react";
import { FileText, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAxiosPrivate } from "@/axios";
import { useRouter } from "next/navigation";

interface FormData {
  exam_name: string;
  questions: File | null;
  student_answers: File | null;
  rag_material: File | null;
}

interface FieldConfig {
  label: string;
  description?: string;
  placeholder?: string;
  type: "input" | "file";
  accept?: string;
  formats?: string[];
}

export default function ExamFormPage(): React.ReactElement {
  const axiosPrivate = useAxiosPrivate();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    exam_name: "",
    questions: null,
    student_answers: null,
    rag_material: null
  });

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: keyof FormData, file: File): void => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const removeFile = (field: keyof FormData): void => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
  };

  const handleSubmit = async(e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try{
      const formDataToSubmit = new FormData();
      for (const key in formData) {
        const value = formData[key as keyof FormData];
        if (value) {
          formDataToSubmit.append(key, value);
        }
      }
      await axiosPrivate.post("/exam/form", formDataToSubmit);
      router.push("/exam/success");
    }catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const fieldConfig: Record<string, FieldConfig> = {
    exam_name: {
      label: "Exam Name",
      placeholder: "Enter the name of your exam",
      type: "input"
    },
    question_paper: {
      label: "Question Paper",
      description: "Upload the exam question paper",
      type: "file",
      accept: ".pdf,.txt,.docx,.doc,.md",
      formats: ["PDF", "TXT", "JPG"]
    },
    answer_papers: {
      label: "Answer Papers", 
      description: "Upload student answer papers",
      type: "file",
      accept: ".pdf,.txt,.docx,.doc,.xlsx,.csv,.zip",
      formats: ["PDF", "TXT", "JPG"]
    },
    rag_material: {
      label: "RAG Material",
      description: "Upload reference materials for evaluation",
      type: "file",
      accept: ".pdf,.txt,.docx,.doc,.md,.json",
      formats: ["PDF", "TXT", "JPG"]
    }
  };

  const renderField = (fieldName: string): React.ReactElement => {
    const config = fieldConfig[fieldName];
    
    if (config.type === "input") {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="text-zinc-700 font-medium">
            {config.label}
          </Label>
          <Input
            id={fieldName}
            type="text"
            value={formData[fieldName as keyof FormData] as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange(fieldName as keyof FormData, e.target.value)
            }
            placeholder={config.placeholder}
            className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
          />
        </div>
      );
    }

    if (config.type === "file") {
      const currentFile = formData[fieldName as keyof FormData] as File | null;
      
      return (
        <div key={fieldName} className="space-y-3">
          <Label className="text-zinc-700 font-medium">
            {config.label}
          </Label>
          <p className="text-sm text-zinc-500">{config.description}</p>
          
          {!currentFile ? (
            <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-zinc-400 transition-colors duration-200 bg-zinc-50/50">
              <input
                type="file"
                accept={config.accept}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(fieldName as keyof FormData, file);
                }}
                className="hidden"
                id={`file-${fieldName}`}
              />
              <label
                htmlFor={`file-${fieldName}`}
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-zinc-600" />
                </div>
                <span className="text-lg font-medium text-zinc-700 mb-2">
                  Click to upload file
                </span>
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                  {config.formats?.map((format: string) => (
                    <Badge key={format} variant="secondary" className="bg-zinc-100 text-zinc-600 text-xs">
                      {format}
                    </Badge>
                  ))}
                </div>
                <span className="text-sm text-zinc-500">
                  Maximum file size: 10MB
                </span>
              </label>
            </div>
          ) : (
            <Card className="border-zinc-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-800">{currentFile.name}</p>
                      <p className="text-sm text-zinc-500">
                        {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fieldName as keyof FormData)}
                    className="text-zinc-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    return <div key={fieldName}></div>;
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Submit Exam Details</h1>
          <p className="text-zinc-600">Upload question paper, answer papers, and reference materials</p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-xl text-zinc-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Exam Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {Object.keys(fieldConfig).map((field: string) => renderField(field))}
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
                  size="lg"
                >
                  Submit Exam Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Form Data Preview */}
        {(formData.exam_name.trim() || formData.questions || formData.student_answers || formData.rag_material) && (
          <Card className="mt-8 border-zinc-200">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-900">Form Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {formData.exam_name.trim() && (
                  <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
                    <Label className="font-medium text-zinc-700">Exam Name</Label>
                    <p className="text-zinc-600 mt-1">{formData.exam_name}</p>
                  </div>
                )}
                {formData.questions && (
                  <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
                    <Label className="font-medium text-zinc-700">Question Paper</Label>
                    <p className="text-zinc-600 mt-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {formData.questions.name}
                    </p>
                  </div>
                )}
                {formData.student_answers && (
                  <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
                    <Label className="font-medium text-zinc-700">Answer Papers</Label>
                    <p className="text-zinc-600 mt-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {formData.student_answers.name}
                    </p>
                  </div>
                )}
                {formData.rag_material && (
                  <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50">
                    <Label className="font-medium text-zinc-700">Reference Material</Label>
                    <p className="text-zinc-600 mt-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {formData.rag_material.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}