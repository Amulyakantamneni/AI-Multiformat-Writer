'use client';

import { useState } from 'react';
import { Sparkles, FileText, Download, Copy, CheckCircle, Zap, Brain, Search } from 'lucide-react';

export default function EssayWriter() {
  const [topic, setTopic] = useState('');
  const [wordLength, setWordLength] = useState('');
  const [includePdf, setIncludePdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const API_URL = 'https://ai-essay-generator-2.onrender.com';

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic!');
      return;
    }
