'use client';

import React, { useState } from 'react';
import { FileText, Loader2, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';

export default function EssayGenerator() {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState('medium');
  const [tone, setTone] = useState('academic');
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // ✅ Fixed invalid character in fallback URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-essay-generator-2.onrender.com';

  const generateEssay = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setEssay('');
    setSources([]);
    setWordCount(0);

    try {
      const response = await fetch(`${API_URL}/generate-essay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, length, tone })
      });

      if (!response.ok) {
        const errorText = await response.text(); // ✅ Show actual backend error
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setEssay(data.essay);
      setWordCount(data.word_count);
      setSources(data.sources || []);
    } catch (err) {
      console.error('Error:', err);
      setError(
        `Failed to generate essay. ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(essay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEssay = () => {
    const file = new Blob([essay], { type: 'text/plain' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `essay-${topic.substring(0, 20)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    // ... your full JSX below remains unchanged
    <div>/* keep your full UI code here */</div>
  );
}
