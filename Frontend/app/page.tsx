'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Loader2, Download, Copy, CheckCircle, AlertCircle, Sparkles, BookOpen, FileBarChart, Newspaper, MessageSquare, Lightbulb, ListChecks, LucideIcon } from 'lucide-react';

interface WritingTool {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  placeholder: string;
  options: {
    length: string[];
    tone: string[];
  };
}

const writingTools: WritingTool[] = [
  {
    id: 'essay',
    name: 'Essay Writer',
    icon: FileText,
    description: 'Academic essays with proper structure',
    color: 'blue',
    placeholder: 'Enter essay topic (e.g., Climate Change, Democracy)',
    options: {
      length: ['short', 'medium', 'long'],
      tone: ['academic', 'casual', 'persuasive']
    }
  },
  {
    id: 'report',
    name: 'Report Generator',
    icon: FileBarChart,
    description: 'Professional business reports',
    color: 'green',
    placeholder: 'Enter report topic (e.g., Q4 Sales Analysis)',
    options: {
      length: ['brief', 'standard', 'detailed'],
      tone: ['formal', 'professional', 'technical']
    }
  },
  {
    id: 'article',
    name: 'Article Writer',
    icon: Newspaper,
    description: 'Blog posts and articles',
    color: 'purple',
    placeholder: 'Enter article topic (e.g., Top 10 Marketing Trends)',
    options: {
      length: ['short', 'medium', 'long'],
      tone: ['informative', 'conversational', 'expert']
    }
  },
  {
    id: 'summary',
    name: 'Text Summarizer',
    icon: ListChecks,
    description: 'Condense long texts into key points',
    color: 'orange',
    placeholder: 'Paste your text to summarize...',
    options: {
      length: ['bullet', 'paragraph', 'detailed'],
      tone: ['concise', 'comprehensive', 'analytical']
    }
  },
  {
    id: 'explanation',
    name: 'Explainer',
    icon: Lightbulb,
    description: 'Explain complex topics simply',
    color: 'yellow',
    placeholder: 'What do you want explained? (e.g., Quantum Computing)',
    options: {
      length: ['simple', 'moderate', 'detailed'],
      tone: ['eli5', 'beginner', 'intermediate']
    }
  },
  {
    id: 'social',
    name: 'Social Media',
    icon: MessageSquare,
    description: 'Posts for all platforms',
    color: 'pink',
    placeholder: 'What\'s your post about?',
    options: {
      length: ['tweet', 'post', 'thread'],
      tone: ['casual', 'professional', 'engaging']
    }
  }
];

export default function AIWritingPlatform() {
  const [selectedTool, setSelectedTool] = useState<WritingTool>(writingTools[0]);
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState('');
  const [tone, setTone] = useState('');
  const [output, setOutput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    setLength(selectedTool.options.length[1]);
    setTone(selectedTool.options.tone[0]);
    setTopic('');
    setOutput('');
    setError('');
  }, [selectedTool]);

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [output]);

  const getColorClasses = (color: string, variant: 'bg' | 'border' | 'text' | 'hover'): string => {
    const colors: Record<string, Record<string, string>> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-600', text: 'text-blue-700', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', border: 'border-green-600', text: 'text-green-700', hover: 'hover:bg-green-100' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-600', text: 'text-purple-700', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-600', text: 'text-orange-700', hover: 'hover:bg-orange-100' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-600', text: 'text-yellow-700', hover: 'hover:bg-yellow-100' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-600', text: 'text-pink-700', hover: 'hover:bg-pink-100' }
    };
    return colors[color][variant];
  };

  const generateContent = async () => {
    if (!topic.trim()) {
      setError('Please enter your topic or text');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');
    setWordCount(0);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool.id,
          topic: topic,
          length: length,
          tone: tone
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setOutput(data.content);
      setWordCount(data.word_count);
    } catch (err) {
      console.error('Error:', err);
      setError(
        `Failed to generate content. ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedTool.name} - ${topic}</title>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
          h1 { color: #1e40af; margin-bottom: 10px; font-size: 28px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb; }
          .content { white-space: pre-wrap; font-size: 16px; line-height: 1.8; }
          @media print { body { margin: 0; padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${topic}</h1>
        <div class="meta">
          <strong>Type:</strong> ${selectedTool.name} | 
          <strong>Length:</strong> ${length} | 
          <strong>Tone:</strong> ${tone} | 
          <strong>Words:</strong> ${wordCount}
        </div>
        <div class="content">${output}</div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  AI Writing Studio
                </h1>
                <p className="text-sm text-gray-600">Professional content generation for every need</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Writing Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {writingTools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool.id === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-5 rounded-xl border-2 transition-all text-left hover:scale-105 transform ${
                    isSelected
                      ? `${getColorClasses(tool.color, 'border')} ${getColorClasses(tool.color, 'bg')} shadow-md`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${isSelected ? getColorClasses(tool.color, 'text') : 'text-gray-400'}`} />
                  <div className="font-semibold text-gray-900 mb-1">{tool.name}</div>
                  <div className="text-xs text-gray-600">{tool.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              {React.createElement(selectedTool.icon, { 
                className: `w-8 h-8 ${getColorClasses(selectedTool.color, 'text')}` 
              })}
              <h2 className="text-2xl font-bold text-gray-900">{selectedTool.name}</h2>
            </div>

            {/* Topic Input */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                {selectedTool.id === 'summary' ? 'Text to Summarize' : 'Topic / Subject'}
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={selectedTool.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                rows={selectedTool.id === 'summary' ? 6 : 3}
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Length */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Length</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedTool.options.length.map((option) => (
                    <button
                      key={option}
                      onClick={() => setLength(option)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
                        length === option
                          ? `${getColorClasses(selectedTool.color, 'border')} ${getColorClasses(selectedTool.color, 'bg')} ${getColorClasses(selectedTool.color, 'text')}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedTool.options.tone.map((option) => (
                    <button
                      key={option}
                      onClick={() => setTone(option)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
                        tone === option
                          ? `${getColorClasses(selectedTool.color, 'border')} ${getColorClasses(selectedTool.color, 'bg')} ${getColorClasses(selectedTool.color, 'text')}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateContent}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          {output && (
            <div ref={outputRef} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 scroll-mt-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Generated Content</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={downloadAsPDF}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-md"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">PDF</span>
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-700 font-semibold">
                  📊 Word Count: {wordCount} words
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {output}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-500">
          <p className="font-medium">Powered by Advanced AI • Multiple Writing Tools</p>
        </div>
      </div>
    </div>
  );
}
